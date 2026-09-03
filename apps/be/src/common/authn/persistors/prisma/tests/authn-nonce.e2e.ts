import { INestApplication } from '@nestjs/common';
import { beforeAll, describe, it } from 'vitest';

import { AuthnException, AuthnModule } from '~common/authn';
import { AuthnNonceService } from '~common/authn/nonce/authn-nonce.service';
import { PrismaAuthnPersistorPlugin } from '~common/authn/persistors/prisma';
import { BadRequestException } from '~common/exceptions';
import { makeId, makeUUID, uuidToId } from '~common/utils/short-uuid';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { AuthnIdentityFixture } from './authn-identity.fixture';
import { AuthnNonceFixture } from './authn-nonce.fixture';
import { createRestTestingModule } from '~test/utils/rest.testing-module';

describe('AuthnNonce E2E', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authnNonceService: AuthnNonceService;
  let authnIdentity: Awaited<ReturnType<typeof AuthnIdentityFixture.fromPartial>>;

  beforeAll(async () => {
    app = await createRestTestingModule({
      imports: [PrismaEphemeralModule.forRoot([]), AuthnModule.forRoot([PrismaAuthnPersistorPlugin])],
    });
    prismaService = app.get(PrismaService);
    authnNonceService = app.get(AuthnNonceService);
    authnIdentity = await AuthnIdentityFixture.fromPartial(prismaService.client, {
      provider: 'local',
      namespace: 'user',
      providerId: 'test@example.com',
    });
  });

  it('should create a nonce ficture and consume it', async ({ expect }) => {
    const nonceFixture = await AuthnNonceFixture.fromPartial(
      prismaService.client,
      { type: 'consume-test' },
      { authnIdentity },
    );

    await authnNonceService.consume(
      { code: nonceFixture.code, type: 'consume-test' },
      { ip: '127.0.0.1', userAgent: 'test' },
    );

    expect(await authnNonceService.find({ id: nonceFixture.entity.id, type: 'consume-test' })).toEqual(
      expect.objectContaining({
        id: nonceFixture.entity.id,
        authId: authnIdentity.entity.id,
        type: 'consume-test',
        usedAt: expect.any(Date),
        usedData: { ip: '127.0.0.1', userAgent: 'test' },
      }),
    );
  });

  it('should generate and consume a nonce', async ({ expect }) => {
    const { code } = await authnNonceService.generate(
      { id: authnIdentity.entity.id },
      { type: 'consume-test-2', expiresIn: 600 },
    );
    const result = await authnNonceService.consume({ code: code, type: 'consume-test-2' }, { ip: '127.0.0.1' });
    expect(result).toEqual(
      expect.objectContaining({
        authnIdentity: expect.objectContaining({ id: authnIdentity.entity.id }),
        nonce: expect.objectContaining({ usedData: { ip: '127.0.0.1' } }),
      }),
    );
  });

  it('should delete existing nonces when generating a new one', async ({ expect }) => {
    const firstResult = await AuthnNonceFixture.fromPartial(
      prismaService.client,
      { type: 'replace-test', createdAt: new Date(Date.now() - 1000) },
      { authnIdentity },
    );
    const secondResult = await authnNonceService.generate(
      { id: authnIdentity.entity.id },
      { type: 'replace-test', expiresIn: 600, throttleSeconds: 0 },
    );
    expect(firstResult.code).not.toBe(secondResult.code);
    expect(await authnNonceService.find({ id: firstResult.entity.id, type: 'replace-test' })).toBeNull();
  });

  it('should throw error when consuming invalid nonce format', async ({ expect }) => {
    await expect(authnNonceService.consume({ code: 'invalid', type: 'not-found' }, {})).rejects.toThrow(
      BadRequestException,
    );
    await expect(
      authnNonceService.consume({ code: `${uuidToId(makeUUID())}:${makeId()}`, type: 'not-found' }, {}),
    ).rejects.toThrow(AuthnException);
    await expect(authnNonceService.consume({ id: makeUUID(), nonce: makeId(), type: 'not-found' }, {})).rejects.toThrow(
      AuthnException,
    );
  });

  it('should throw error when consuming expired nonce', async ({ expect }) => {
    const nonceFixture = await AuthnNonceFixture.fromPartial(
      prismaService.client,
      { type: 'expired-test', expiresAt: new Date(Date.now() - 1000) },
      { authnIdentity },
    );
    await expect(authnNonceService.consume({ code: nonceFixture.code, type: 'expired-test' }, {})).rejects.toThrow(
      AuthnException,
    );
  });

  it('should throw error when consuming already used nonce', async ({ expect }) => {
    const nonceFixture = await AuthnNonceFixture.fromPartial(
      prismaService.client,
      { type: 'used-test', usedAt: new Date() },
      { authnIdentity },
    );
    await expect(authnNonceService.consume({ code: nonceFixture.code, type: 'used-test' }, {})).rejects.toThrow(
      AuthnException,
    );
  });

  it('should throw error when consuming nonce with invalid hash', async ({ expect }) => {
    const nonceFixture = await AuthnNonceFixture.fromPartial(
      prismaService.client,
      { type: 'invalid-hash-test' },
      { authnIdentity },
    );
    await expect(
      authnNonceService.consume(
        { code: `${uuidToId(nonceFixture.entity.id)}:${makeId()}`, type: 'invalid-hash-test' },
        {},
      ),
    ).rejects.toThrow(AuthnException);
  });

  it('should throw error when generating nonce for non-existent identity', async ({ expect }) => {
    await expect(authnNonceService.generate({ id: makeUUID() }, { type: 'test', expiresIn: 600 })).rejects.toThrow(
      AuthnException,
    );
  });

  it('should delete nonces by criteria', async ({ expect }) => {
    const nonce1 = await AuthnNonceFixture.fromPartial(
      prismaService.client,
      { type: 'delete-test' },
      { authnIdentity },
    );
    await authnNonceService.delete({ authId: authnIdentity.entity.id, type: 'delete-test' });
    expect(await authnNonceService.find({ id: nonce1.entity.id, type: 'delete-test' })).toBeNull();
  });

  it('should throttle nonce creation within default 15 seconds', async ({ expect }) => {
    await authnNonceService.generate({ id: authnIdentity.entity.id }, { type: 'throttle-test', expiresIn: 600 });
    await expect(
      authnNonceService.generate({ id: authnIdentity.entity.id }, { type: 'throttle-test', expiresIn: 600 }),
    ).rejects.toThrow(AuthnException);
  });

  it('should allow nonce creation after throttle window expires', async ({ expect }) => {
    await AuthnNonceFixture.fromPartial(
      prismaService.client,
      { type: 'throttle-expired-test', createdAt: new Date(Date.now() - 200) },
      { authnIdentity },
    );
    const result = await authnNonceService.generate(
      { id: authnIdentity.entity.id },
      { type: 'throttle-expired-test', expiresIn: 600, throttleSeconds: 0.1 },
    );
    expect(result.code).toContain(':');
    expect(result.expiresAt).toBeInstanceOf(Date);
  });

  it('should decrement attempts on invalid hash consumption', async ({ expect }) => {
    const nonceFixture = await AuthnNonceFixture.fromPartial(
      prismaService.client,
      { type: 'attempts-test', attempts: 1 },
      { authnIdentity },
    );
    await expect(
      authnNonceService.consume({ code: `${uuidToId(nonceFixture.entity.id)}:${makeId()}`, type: 'attempts-test' }, {}),
    ).rejects.toThrow(AuthnException);

    // valid code but exhausted attempts
    await expect(authnNonceService.consume({ code: nonceFixture.code, type: 'blocked-test' }, {})).rejects.toThrow(
      AuthnException,
    );
  });

  it('should generate a nonce with a custom nonce', async ({ expect }) => {
    const { nonce, id } = await authnNonceService.generate(
      { id: authnIdentity.entity.id },
      { type: 'custom-nonce-test', expiresIn: 600, nonce: '1234' },
    );
    const consumeResult = await authnNonceService.consume({ nonce, id, type: 'custom-nonce-test' }, {});
    expect(consumeResult).toEqual(
      expect.objectContaining({
        authnIdentity: expect.objectContaining({ id: authnIdentity.entity.id }),
      }),
    );
  });
});
