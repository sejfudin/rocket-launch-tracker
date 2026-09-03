import { mock } from 'node:test';

import { Controller, Get, HttpStatus, type INestApplication, Query } from '@nestjs/common';
import request from 'supertest';
import { beforeAll, describe, it } from 'vitest';

import { ApiPaginationResponse, PaginationDto } from '~common/http/pagination';

import { PrismaService } from '~database/prisma';
import { PrismaEphemeralModule } from '~database/prisma/prisma.ephemeral.module';

import { UserModule } from '~modules/users/user';
import { IUserPaginationQuery, UserPaginationQueryDto } from '~modules/users/user/models';
import { UserResponse } from '~modules/users/user/models/user.response';
import { UserPrismaRepositoryPlugin } from '~modules/users/user/persistors/prisma/user.prisma-repository';
import { UserFixture } from '~modules/users/user/tests/user.fixture';
import { UserRepository } from '~modules/users/user/user.repository';

import { createRestTestingModule } from '~test/utils/rest.testing-module';

const mockPaginateQueryCall = mock.fn(
  // check static types
  (query: IUserPaginationQuery) => query.order?.some((x) => x?.direction) && query.filter?.ids && false,
);

@Controller()
class MyUserAdminController {
  constructor(private readonly userAdminRepository: UserRepository) {}

  @Get()
  @ApiPaginationResponse(UserResponse)
  async paginate(@Query() query: UserPaginationQueryDto): Promise<PaginationDto<UserResponse>> {
    mockPaginateQueryCall(query);

    const entities = await this.userAdminRepository.paginate(query);
    return PaginationDto.fromDomain(entities, UserResponse.fromDomain);
  }
}

/**
 * While testing Admins, this is also the only prisma pagination e2e test since prisma requires an entity and Admin
 *  is the most common entity in the system.
 */
describe('User Admin Pagination', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  const totalItems = 7;

  let lastQuery: Record<string, unknown>;
  mockPaginateQueryCall.mock.mockImplementation((query) => {
    lastQuery = JSON.parse(JSON.stringify(query));
    return false;
  });

  beforeAll(async () => {
    app = await createRestTestingModule({
      imports: [PrismaEphemeralModule.forRoot([UserPrismaRepositoryPlugin]), UserModule],
      providers: [],
      controllers: [MyUserAdminController],
    });

    prismaService = app.get(PrismaService);

    await Promise.all([
      ...Array.from({ length: totalItems }, (_, i) => `John ${i + 1}`).map((x) =>
        UserFixture.fromPartial(prismaService.client, { name: x }),
      ),
      UserFixture.fromPartial(prismaService.client, { name: 'Jake' }),
    ]);
  });

  it('should paginate users', async ({ expect }) => {
    const response = await request(app.getHttpServer())
      .get('/?order=name&limit=5&filter[search]=John&page=1')
      .expect(HttpStatus.OK);

    expect(lastQuery).toEqual({
      page: 1,
      limit: 5,
      order: [{ property: 'name', direction: 'asc' }],
      filter: { search: 'John' },
    });

    expect(response.body).toEqual(
      expect.objectContaining({
        // there should only be John
        items: response.body.items.map(() => expect.objectContaining({ name: expect.stringContaining('John') })),
        limit: 5,
        page: 1,
        totalItems: totalItems,
      }),
    );

    // ascending order
    const names = response.body.items.map((item: UserResponse) => item.name);
    expect(names).toEqual([...names].sort((a, b) => (a > b ? 1 : -1)));
  });

  it('should paginate users using cursors', async ({ expect }) => {
    // no cursor should return the first page
    await request(app.getHttpServer()).get('/?order=name&limit=5&filter[search]=John').expect(HttpStatus.OK);
    expect(lastQuery).toEqual({
      limit: 5,
      order: [{ property: 'name', direction: 'asc' }],
      filter: { search: 'John' },
    });

    const firstResponse = await request(app.getHttpServer())
      .get('/?order=name&limit=5&filter[search]=John&cursor=id')
      .expect(HttpStatus.OK);

    expect(lastQuery).toEqual({
      cursor: 'id',
      limit: 5,
      order: [{ property: 'name', direction: 'asc' }],
      filter: { search: 'John' },
    });

    const firstSet: PaginationDto<UserResponse> = firstResponse.body;
    expect(firstSet.items.length).toBe(5);
    expect(firstSet.items[firstSet.items.length - 1].id).toEqual(firstSet.nextCursor?.split(':')[1]);

    expect(firstSet).toEqual(
      expect.objectContaining({
        // there should only be John
        items: firstSet.items.map(() => expect.objectContaining({ name: expect.stringContaining('John') })),
        limit: 5,
        // first response should just be the cursor key
        cursor: `id`,
        totalItems: totalItems,
      }),
    );

    const nextResponse = await request(app.getHttpServer())
      .get(`/?order=name&limit=5&filter[search]=John&cursor=${firstSet.nextCursor}`)
      .expect(HttpStatus.OK);

    expect(nextResponse.body).toEqual(
      expect.objectContaining({
        // there should only be John
        items: nextResponse.body.items.map(() => expect.objectContaining({ name: expect.stringContaining('John') })),
        limit: 5,
        cursor: firstSet.nextCursor,
        totalItems: totalItems,
      }),
    );

    // ascending order
    const names = nextResponse.body.items.map((item: UserResponse) => item.name);
    expect(names).toEqual([...names].sort((a, b) => (a > b ? 1 : -1)));
  });
});
