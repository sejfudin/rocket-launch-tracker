import { Readable } from 'node:stream';

import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Pool, type PoolClient } from 'pg';

import { CoreConfig } from '~common/core';
import { LoggerService } from '~common/logger';
import { ISettingsSection, SettingsPopulate, SettingsSettingAction, SettingsStatus } from '~common/settings';
import type { JsonObject } from '~common/types';

import { PrismaService } from '~database/prisma';

import { MediaProviderError } from '../../media.exceptions';
import { MediaLoader } from '../../media.loader';
import type { MediaProvider } from '../../media-provider.abstract';
import type { IMediaConstraints, IMediaFetchInstructions, IMediaFile, IMediaUploadInstructions } from '../../models';
import { PrismaMediaProviderConfig } from './prisma-media.provider.config';
import { IPrismaMediaProviderJWTToken, PRISMA_MEDIA_PROVIDER_NAME } from './prisma-media.provider.types';

@Injectable()
export class PrismaMediaProvider implements MediaProvider, OnModuleInit, OnModuleDestroy {
  readonly name = PRISMA_MEDIA_PROVIDER_NAME;
  private readonly secret: string;
  private _pgPool: Pool | null = null;

  constructor(
    private readonly mediaProviderConfig: PrismaMediaProviderConfig,
    private readonly coreConfig: CoreConfig,
    private readonly mediaLoader: MediaLoader,
    private readonly prismaService: PrismaService,
    private readonly logger: LoggerService,
  ) {
    this.secret = this.mediaProviderConfig.secret;
  }

  async onModuleInit() {
    if (!this.mediaProviderConfig.enabled) return;

    const url = this.prismaService.databaseUrl;
    if (!url || (!url.startsWith('postgresql://') && !url.startsWith('postgres://'))) {
      throw new MediaProviderError(
        `Prisma media provider only supports PostgreSQL databases. Found: ${url?.split('://')[0]}`,
        {
          code: 'media-provider-unsupported-database',
        },
      );
    }

    this._pgPool = new Pool({
      connectionString: url,
      max: 20,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    await this.ensureLoExtension();

    this.mediaLoader.registerProvider(PRISMA_MEDIA_PROVIDER_NAME, this);
  }

  onModuleDestroy() {
    if (this._pgPool) {
      this._pgPool.end();
      this._pgPool = null;
    }
  }

  private async ensureLoExtension() {
    const client: PoolClient = await this.pgPool.connect();
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS lo');
    } finally {
      client.release();
    }
  }

  private get pgPool(): Pool {
    if (!this._pgPool) {
      throw new MediaProviderError(`PostgreSQL pool not initialized`, {
        code: 'media-provider-pool-not-initialized',
      });
    }
    return this._pgPool;
  }

  /**
   * Return the object metadata
   */
  public async getMeta(key: string): Promise<{ fileSize?: number; mimeType?: string }> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    // if it was stored, its already in the database and was validated
    const metadata = await this.prismaService.client.media.findUnique({
      where: { key },
      select: { fileSize: true, mimeType: true },
    });
    if (!metadata) {
      throw new MediaProviderError(`Media not found`, {
        code: 'media-provider-media-not-found',
      });
    }
    return metadata;
  }

  public async createUploadRequest(
    file: IMediaFile,
    options: {
      // file key
      key: string;

      // suggested upload method
      method?: string;

      // arbitrary options for the provider
      providerOptions?: {
        // expiration time in seconds
        expiresIn?: number;
      };

      constraints?: IMediaConstraints;
    },
  ): Promise<Omit<IMediaUploadInstructions, 'id'>> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    const key = options.key;
    const expiresIn = options?.providerOptions?.expiresIn || 60 * 15;

    const method = options.method || this.mediaProviderConfig.uploadMethods[0];
    if (!this.mediaProviderConfig.uploadMethods.includes(method)) {
      throw new MediaProviderError(`Invalid upload method: '${method}'`, {
        code: 'media-provider-invalid-upload-method',
      });
    }

    await this.prismaService.client.$transaction(async (tx) => {
      const media = await tx.media.findUnique({
        where: { key },
      });

      if (media) {
        if (media.provider !== PRISMA_MEDIA_PROVIDER_NAME) {
          throw new MediaProviderError(`Media provider mismatch`, {
            code: 'media-provider-provider-mismatch',
          });
        }

        if (media.uploaded) {
          throw new MediaProviderError(`Media already uploaded`, {
            code: 'media-provider-media-already-uploaded',
          });
        }
      } else {
        await tx.media.create({
          data: {
            key,
            fileSize: file.fileSize,
            mimeType: file.mimeType,
            fileName: file.fileName,
            provider: PRISMA_MEDIA_PROVIDER_NAME,
            resourceName: `uncategorized/${key}`,
          },
        });
      }
    });

    const [token] = await this.signRequest(
      {
        key,
        fsz: file.fileSize.toString(),
        mtp: file.mimeType,
      },
      {
        audience: 'media:upload',
        expiresAt: Math.floor(Date.now() / 1000) + expiresIn,
      },
    );

    switch (method) {
      case 'post': {
        return {
          method: 'post',
          url: `${this.coreConfig.apiBaseUrl}/api/media/provider/prisma/upload`,
          fields: [
            ['key', key],
            ['fileSize', file.fileSize.toString()],
            ['mimeType', file.mimeType.toString()],
            ['token', token],
          ],
          provider: PRISMA_MEDIA_PROVIDER_NAME,
        };
      }
      default:
        throw new MediaProviderError(`Invalid upload method: '${options?.method}'`, {
          code: 'media-provider-invalid-upload-method',
        });
    }
  }

  public async createFetchRequest(
    data: { key: string },
    options?: {
      // arbitrary options for the provider
      providerOptions?: {
        // expiration time in seconds
        expiresIn?: number;

        publicUrl?: string;

        signFetch?: boolean;
      };
    },
  ): Promise<Omit<IMediaFetchInstructions, 'id'>> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    const expiresIn = options?.providerOptions?.expiresIn || this.mediaProviderConfig.signFetchExpiresIn;
    const signFetch = options?.providerOptions?.signFetch ?? this.mediaProviderConfig.signFetch ?? false;
    const key = data.key;

    let url =
      options?.providerOptions?.publicUrl || this.mediaProviderConfig.publicUrl || '/api/media/provider/prisma/fetch';
    if (url.startsWith('/')) {
      url = this.coreConfig.apiBaseUrl + url;
    }

    url += `/${key}`;

    const [token] = await this.signRequest(
      { key },
      { audience: 'media:fetch', expiresAt: Math.floor(Date.now() / 1000) + expiresIn },
    );

    if (signFetch) {
      url += `?token=${token}`;
    }

    return {
      url,
    };
  }

  private async streamFromLargeObject(loOid: number): Promise<Readable> {
    const pool = this.pgPool;
    const client: PoolClient = await pool.connect();
    let fd: number | null = null;
    let transactionActive = false;
    let connectionReleased = false;

    const releaseConnection = async () => {
      if (connectionReleased) return;
      connectionReleased = true;

      if (fd !== null) {
        await client.query('SELECT lo_close($1::int)', [fd]).catch(() => {});
        fd = null;
      }
      if (transactionActive) {
        await client.query('ROLLBACK').catch(() => {});
        transactionActive = false;
      }
      client.release();
    };

    try {
      await client.query('BEGIN');
      transactionActive = true;

      const openResult = await client.query<{ lo_open: number }>('SELECT lo_open($1::oid, $2::int) as lo_open', [
        loOid,
        0x40000,
      ]);
      fd = openResult.rows[0].lo_open;
      if (fd === -1) {
        throw new MediaProviderError(`Failed to open large object for reading`, {
          code: 'media-provider-lo-open-failed',
        });
      }

      const chunkSize = 8192;
      const blobStream = new Readable({
        async read() {
          if (fd === null || connectionReleased) {
            this.push(null);
            return;
          }

          try {
            const readResult = await client.query<{ lo_read: Buffer }>('SELECT loread($1::int, $2::int) as lo_read', [
              fd,
              chunkSize,
            ]);
            const data = readResult.rows[0].lo_read;
            if (data.length === 0) {
              await releaseConnection();
              this.push(null);
            } else {
              this.push(data);
            }
          } catch (error) {
            await releaseConnection();
            this.destroy(error as Error);
          }
        },
        destroy(error, callback) {
          releaseConnection().finally(() => {
            callback(error);
          });
        },
      });

      return blobStream;
    } catch (error) {
      await releaseConnection();
      throw error;
    }
  }

  public async download(key: string): Promise<{
    stream: Readable;
    fileSize: number;
    mimeType: string;
  }> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    const media = await this.prismaService.client.media.findUnique({
      where: { key },
      select: {
        fileSize: true,
        mimeType: true,
        loOid: true,
      },
    });

    if (!media) {
      throw new MediaProviderError(`Media not found`, {
        code: 'media-provider-media-not-found',
        details: { key },
      });
    }

    if (!media.loOid) {
      throw new MediaProviderError(`Media large object not found`, {
        code: 'media-provider-lo-not-found',
      });
    }

    const stream = await this.streamFromLargeObject(media.loOid);

    return {
      stream,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
    };
  }

  private async signRequest(
    payload: { key: string } & Record<string, string | number>,
    options: { audience: 'media:upload' | 'media:fetch'; expiresAt: number; prefix?: string },
  ): Promise<[string, IPrismaMediaProviderJWTToken]> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    if (!this.secret) {
      throw new Error('JWT signing is not configured');
    }
    const iat = Math.floor(Date.now() / 1000);
    const tokenData: IPrismaMediaProviderJWTToken = {
      ...payload,
      iat,
      exp: options.expiresAt,
      aud: options.audience,
    };
    const token = jwt.sign(tokenData, this.secret);
    return [options.prefix ? `${options.prefix}${token}` : token, tokenData];
  }

  private async verifyRequest(
    rawToken: string,
    options: { audience: string; prefix?: string },
  ): Promise<IPrismaMediaProviderJWTToken | null> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    if (!this.secret) {
      throw new Error('JWT signing is not configured');
    }
    if (!rawToken) {
      throw new Error('No token provided');
    }
    const token = options.prefix ? rawToken.replace(RegExp(`^${options.prefix}`), '') : rawToken;
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object' || !decoded.aud || decoded.aud !== options.audience) {
      return null;
    }
    try {
      jwt.verify(token, this.secret);
    } catch (_e) {
      return null;
    }
    return decoded as IPrismaMediaProviderJWTToken;
  }

  public async upload(
    stream: Readable,
    file: IMediaFile,
    options: {
      key: string;
    },
  ): Promise<{ key: string }> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    const media = await this.prismaService.client.media.findUnique({
      where: { key: options.key },
    });

    if (media) {
      if (media.uploaded) {
        throw new MediaProviderError(`Media already exists`, {
          code: 'media-provider-media-already-exists',
        });
      }

      if (media.provider !== PRISMA_MEDIA_PROVIDER_NAME) {
        throw new MediaProviderError(`Media provider mismatch`, {
          code: 'media-provider-provider-mismatch',
        });
      }

      // todo, validate mime type, upload size, etc.
    } else {
      await this.prismaService.client.media.create({
        data: {
          key: options.key,
          fileSize: file.fileSize,
          mimeType: file.mimeType,
          fileName: file.fileName,
          provider: PRISMA_MEDIA_PROVIDER_NAME,
          resourceName: `uncategorized/${options.key}`,
        },
      });
    }

    await this.streamToLargeObject(stream, options);
    return { key: options.key };
  }

  private async streamToLargeObject(
    stream: Readable,
    options: {
      key: string;
    },
  ): Promise<void> {
    const pool = this.pgPool;
    const client: PoolClient = await pool.connect();
    let fd: number | null = null;
    let transactionActive = false;

    const key = options.key;
    if (!key) {
      throw new MediaProviderError(`Key not provided`, {
        code: 'media-provider-key-not-provided',
      });
    }

    try {
      await client.query('BEGIN');
      transactionActive = true;

      const media = await client
        .query<{ loOid: number | null }>('SELECT "loOid" FROM "Media" WHERE "key" = $1', [key])
        .then((result) => result.rows[0]);

      if (!media) {
        throw new MediaProviderError(`Media not found`, {
          code: 'media-provider-media-not-found',
        });
      }

      if (media.loOid) {
        await client
          .query<{ lo_unlink: number }>('SELECT lo_unlink($1::oid) as lo_unlink', [media.loOid])
          .catch((error: unknown) => {
            this.logger.error(`Failed to delete old large object`, {
              cause: error,
              details: {
                key,
                loid: media.loOid?.toString(),
              },
            });
          });
      }

      const createResult = await client.query<{ lo_create: number }>('SELECT lo_create(0::oid) as lo_create');
      const loOid = createResult.rows[0].lo_create;
      if (loOid === 0) {
        throw new MediaProviderError(`Failed to create large object`, {
          code: 'media-provider-lo-create-failed',
        });
      }

      fd = await client
        .query<{ lo_open: number }>('SELECT lo_open($1::oid, $2::int) as lo_open', [loOid, 0x20000])
        .then((result) => result.rows[0].lo_open);

      if (fd === -1) {
        throw new MediaProviderError(`Failed to open large object for writing`, {
          code: 'media-provider-lo-open-failed',
        });
      }

      const chunkSize = 8192;
      for await (const chunk of stream) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        let offset = 0;
        while (offset < buffer.length) {
          const writeChunk = buffer.subarray(offset, Math.min(offset + chunkSize, buffer.length));
          const writeResult = await client.query<{ lo_write: number }>(
            'SELECT lowrite($1::int, $2::bytea) as lo_write',
            [fd, writeChunk],
          );
          if (writeResult.rows[0].lo_write === -1) {
            throw new MediaProviderError(`Failed to write to large object`, {
              code: 'media-provider-lo-write-failed',
            });
          }
          offset += writeChunk.length;
        }
      }

      const closeResult = await client
        .query<{ lo_close: number }>('SELECT lo_close($1::int) as lo_close', [fd])
        .then((result) => result.rows[0].lo_close);
      fd = null;
      if (closeResult === -1) {
        throw new MediaProviderError(`Failed to close large object`, {
          code: 'media-provider-lo-close-failed',
        });
      }

      await client.query(
        'UPDATE "Media" SET "loOid" = $1::oid, "uploaded" = NOW(), "updatedAt" = NOW(), "validated" = NOW() WHERE "key" = $2',
        [loOid, key],
      );

      await client.query('COMMIT');
      transactionActive = false;
    } catch (error) {
      if (fd !== null) {
        await client.query('SELECT lo_close($1::int)', [fd]).catch(() => {});
        fd = null;
      }
      if (transactionActive) {
        await client.query('ROLLBACK').catch(() => {});
        transactionActive = false;
      }
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Validate the presigned token and upload a file to the database
   */
  public async uploadWithToken(token: IPrismaMediaProviderJWTToken | string, stream: Readable): Promise<void> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    const request = typeof token === 'string' ? await this.verifyRequest(token, { audience: 'media:upload' }) : token;

    if (!request) {
      throw new MediaProviderError(`Invalid token`, {
        code: 'media-provider-invalid-token',
      });
    }

    await this.streamToLargeObject(stream, {
      key: request.key,
    });
  }

  public async downloadWithToken(token: IPrismaMediaProviderJWTToken | string): Promise<{
    stream: Readable;
    fileSize: number;
    mimeType: string;
  }> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    const request = typeof token === 'string' ? await this.verifyRequest(token, { audience: 'media:fetch' }) : token;

    if (!request) {
      throw new MediaProviderError(`Invalid token`, {
        code: 'media-provider-invalid-token',
      });
    }

    const { key } = request;
    const media = await this.prismaService.client.media.findUnique({
      where: { key },
      select: {
        fileSize: true,
        mimeType: true,
        loOid: true,
      },
    });

    if (!media) {
      throw new MediaProviderError(`Media not found`, {
        code: 'media-provider-media-not-found',
      });
    }

    if (!media.loOid) {
      throw new MediaProviderError(`Media large object not found`, {
        code: 'media-provider-lo-not-found',
      });
    }

    return {
      stream: await this.streamFromLargeObject(media.loOid),
      fileSize: media.fileSize,
      mimeType: media.mimeType,
    };
  }

  public async delete(key: string, _options?: { providerOptions?: JsonObject }): Promise<void> {
    if (!this.mediaProviderConfig.enabled) {
      throw new MediaProviderError(`Prisma media provider is not enabled`, {
        code: 'prisma-media-provider-not-enabled',
      });
    }

    const media = await this.prismaService.client.media.findUnique({
      where: { key },
      select: { loOid: true },
    });

    if (!media) {
      return;
    }

    if (!media.loOid) {
      return;
    }

    const pool = this.pgPool;
    const client: PoolClient = await pool.connect();

    try {
      await client.query('BEGIN');
      try {
        const unlinkResult = await client.query<{ lo_unlink: number }>('SELECT lo_unlink($1::oid) as lo_unlink', [
          media.loOid,
        ]);
        if (unlinkResult.rows[0].lo_unlink !== 1) {
          throw new MediaProviderError(`Failed to delete large object`, {
            code: 'media-provider-lo-unlink-failed',
          });
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    } finally {
      client.release();
    }
  }

  async getSettings(options: { populate?: Array<SettingsPopulate> }): Promise<ISettingsSection> {
    let status = SettingsStatus.Ok;
    let statusMessage = 'Files are stored as PostgreSQL Large Objects';

    return {
      name: PRISMA_MEDIA_PROVIDER_NAME,
      label: 'Database Storage',
      status,
      statusMessage,
      items: options.populate?.includes(SettingsPopulate.Items)
        ? [
            {
              name: 'publicUrl',
              label: 'Public URL',
              value: this.mediaProviderConfig.publicUrl,
              actions: [SettingsSettingAction.Copy],
            },
          ]
        : undefined,
    };
  }
}
