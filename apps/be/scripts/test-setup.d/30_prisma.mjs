#!/usr/bin/env zx

import os from 'os';

import { $, spinner } from 'zx';

$.env.STAGE = 'test';
const CI = !!process.env.CI;

if (!CI) {
  // Get database URL from config
  const DATABASE_URL = (await $`resolve-config get --target resolved --property prisma.url`).stdout.trim();
  const { hostname: host, port } = new URL(DATABASE_URL);

  // Check if database port is accepting connections
  const isDatabaseRunning = async () => {
    try {
      if (os.platform() === 'win32') {
        const result =
          await $`powershell -Command "Test-NetConnection -ComputerName ${host} -Port ${port} -InformationLevel Quiet"`;
        return result.stdout.trim() === 'True';
      }
      return (await $`nc -z ${host} ${port}`.exitCode) === 0;
    } catch {
      return false;
    }
  };

  // Main logic
  if (!(await isDatabaseRunning())) {
    await $`echo "Starting docker compose..."`;
    await $`docker compose --profile test up -d`;
    await spinner('Waiting for database to be ready...', async () => {
      for (let retries = 30; retries > 0; retries--) {
        if (await isDatabaseRunning()) return;
        console.log(`Waiting for database to be ready... ${retries} retries left`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      throw new Error('Database failed to start in time');
    });
  }
}

$.env.PRISMA_HIDE_UPDATE_MESSAGE = '1';
$.env.CHECKPOINT_DISABLE = '1';

// generate prisma client
await $`npx prisma generate --no-hints`;

// check if migrations exist
const migrationsExist =
  await $`find resources/prisma/migrations -maxdepth 1 -type d -name '[0-9]*' 2>/dev/null || true`.then(
    (result) => result.stdout.trim().length > 0,
  );

if (!migrationsExist) {
  // if no migrations exist, use the schema as a initial database
  await $`npx prisma db push`;
} else {
  // migrate database
  await $`npx prisma migrate reset --force`;
  await $`npx prisma db seed`;
}
