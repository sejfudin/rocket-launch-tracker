import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { Allow } from 'class-validator';
import * as jwt from 'jsonwebtoken';
import { IsFile, MemoryStoredFile, isFile } from 'nestjs-form-data';

import { getConfig } from '~common/config';
import { ValidateInline } from '~common/validate';

import { PrismaMediaProviderConfig } from '../prisma-media.provider.config';
import { IPrismaMediaProviderJWTToken } from '../prisma-media.provider.types';

const prismaMediaProviderConfig = getConfig(PrismaMediaProviderConfig);

export class PrismaMediaProviderUploadDto {
  @ApiProperty({ type: 'string' })
  @Expose()
  @Transform(async ({ value }) => jwt.verify(value, prismaMediaProviderConfig.secret, { audience: 'media:upload' }))
  @Allow()
  token!: Promise<IPrismaMediaProviderJWTToken>;

  @Expose()
  @ValidateInline(
    async ({ object, value }) => {
      const obj = object as PrismaMediaProviderUploadDto;
      return (await obj.token).fsz === (value as string);
    },
    { message: 'Invalid file size' },
  )
  fileSize!: string;

  @Expose()
  @ValidateInline(
    async ({ object, value }) => {
      const obj = object as PrismaMediaProviderUploadDto;
      return (await obj.token).mtp === (value as string);
    },
    { message: 'Invalid mime type' },
  )
  mimeType!: string;

  @Expose()
  @ValidateInline(
    async ({ object, value }) => {
      const obj = object as PrismaMediaProviderUploadDto;
      return (await obj.token).key === (value as string);
    },
    { message: 'Invalid key' },
  )
  key!: string;

  @Expose()
  @IsFile()
  @ValidateInline(
    async ({ object, value }) => {
      const val = value as MemoryStoredFile;
      if (!isFile(val)) {
        return false;
      }
      const obj = object as PrismaMediaProviderUploadDto;
      const { fsz, mtp } = await obj.token;
      // validate size and mime type to match the token
      return !(val.size.toString() !== fsz || val.mimeTypeWithSource.value !== mtp);
    },
    { message: 'File does not match request' },
  )
  file!: MemoryStoredFile;
}
