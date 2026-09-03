#!/usr/bin/env zx

import { $ } from 'zx';

// get Prisma environment variables
const DATABASE_AUTO_MIGRATE = (
  await $`resolve-config get --target resolved --property prisma.autoMigrate`
).stdout.trim();

$.env.PRISMA_HIDE_UPDATE_MESSAGE = '1';
$.env.CHECKPOINT_DISABLE = '1';

await $`npx prisma generate --no-hints`;

if (DATABASE_AUTO_MIGRATE === 'true') {
  // migrate prisma database
  await $`npx prisma migrate deploy`;
}
