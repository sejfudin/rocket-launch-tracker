import { type PrismaClient } from '~database/prisma/client';

export abstract class PrismaService {
  public abstract client: PrismaClient;
  public abstract databaseUrl?: string;
}
