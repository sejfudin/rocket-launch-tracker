#!/usr/bin/env zx

import os from 'os';

import { $, question, spinner } from 'zx';

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
  console.log(`⚠ Database is not running on ${host}:${port} - would you like to start it with docker compose? (y/n)`);

  if (!['y', 'yes'].includes((await question('Start docker compose? (y/n) ')).toLowerCase())) {
    console.log('Skipping migrations...');
  } else {
    await $`docker compose up -d`;
    await spinner('Waiting for database to be ready...', async () => {
      for (let retries = 30; retries > 0; retries--) {
        if (await isDatabaseRunning()) return;
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      throw new Error('Database failed to start in time');
    });
    await $`npx prisma migrate dev`;
  }
} else {
  console.log(`Applying migrations to database on ${host}:${port}`);
  await $`npx prisma migrate dev`;
}
