import { getConfig } from '~common/config';

import { PrismaClient } from '~database/prisma/client';
import { PrismaConfig } from '~database/prisma/prisma.config';
import { getPrismaClient } from '~database/prisma/prisma-client.helper';

export function getDefaultPrismaClient(): PrismaClient {
  const prismaConfig = getConfig(PrismaConfig);
  return getPrismaClient(prismaConfig);
}
