#!/usr/bin/env tsx

// oxlint-disable no-console, no-explicit-any, no-unsafe-assignment, no-unsafe-member-access, no-unsafe-call

import { readFileSync, globSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';

import { getDefaultPrismaClient } from '../../../src/database/prisma/prisma-client';
import { PrismaFixture, FixtureGenerator } from '../../../src/database/prisma/fixtures';

async function discoverFixtures(): Promise<Map<string, PrismaFixture<any>>> {
  const prismaFixtures = new Map<string, PrismaFixture<any>>();
  const srcDir = join(__dirname, '../../../src');
  const fixtureFiles = globSync('**/*.fixture.ts', {
    cwd: srcDir,
  });
  for (const relativePath of fixtureFiles) {
    const modulePath = join(srcDir, relativePath);
    try {
      const module = await import(pathToFileURL(modulePath).href) as Record<string, PrismaFixture<any>>;
      for (const [exportName, exportValue] of Object.entries(module).filter(([exportName]) => exportName.endsWith('Fixture'))) {
        prismaFixtures.set(exportName.replace('Fixture', ''), exportValue);
      }
    } catch (importError) {
      console.warn(`   ⚠ Failed to import from ${modulePath}:`, importError);
      process.exit(1);
    }
  }
  return prismaFixtures;
}

async function * getSeed(seedFilePath: string): AsyncGenerator<any> {
  const parsedYaml: any = parseYaml(readFileSync(seedFilePath, 'utf-8'));
  if (Array.isArray(parsedYaml)) {
    for (const item of parsedYaml) {
      yield item;
    }
  } else {
    throw new Error('Invalid seed file');
  }
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  const prisma = getDefaultPrismaClient();

  const fixtureMap = await discoverFixtures();

  const seededData: Record<string, PrismaFixture<any>[]> = {};

  // Process all sections
  for await (const { type, data, relations } of getSeed(join(__dirname, 'seed.yaml'))) {

    if (!type || !fixtureMap.has(type)) {
      console.log(` ⚠️  Warning: Unknown fixture type ${type}`);
      continue;
    }

    const resolvedRelations: Record<string, any> = {};

    const resolveFixtureReference = (value: string) => {
      // extract using regex, format: FixtureName(NumberOrString)
      const match = value.match(/(\w+)\(([^)]+)\)/);
      if (!match) {
        throw new Error(`Invalid fixture reference`);
      }

      const [, fixtureName, fixtureReference] = match;
      if (!fixtureMap.has(fixtureName)) {
        throw new Error(`Unknown fixture: ${fixtureName}`);
      }

      if (/^[0-9]+$/.test(fixtureReference)) {
        const fixtureIndex = parseInt(fixtureReference, 10);
        if (isNaN(fixtureIndex) || fixtureIndex < 0 || fixtureIndex >= seededData[fixtureName].length) {
          throw new Error(`Related fixture does not exit (yet?)`);
        }
        return seededData[fixtureName][fixtureIndex];
      }

      // find existing ficture by key=value
      const [k, v] = fixtureReference.split('=');
      if (!k || !v) {
        throw new Error(`Invalid fixture kev/value reference`);
      }
      const relatedFixture = seededData[fixtureName].find((fixture) => fixture.entity[k] === v);
      if (!relatedFixture) {
        throw new Error(`Related fixture does not exit (yet?)`);
      }
      return relatedFixture;
    }


    if (relations) {
      for (const [key, value] of Object.entries(relations)) {
        try {
          if (typeof value === 'string') {
            resolvedRelations[key] = resolveFixtureReference(value);
          } else if (Array.isArray(value)) {
            resolvedRelations[key] = value.map(resolveFixtureReference);
          } else {
            resolvedRelations[key] = value;
          }
        } catch (e) {
          console.error(`Error resolving relation for ${key}: ${e.message}`);
          continue;
        }
      }
    }

    let fixture: PrismaFixture<any>;
    const fixtureClass = fixtureMap.get(type)!;
    try {
      if (!('fromPartial' in fixtureClass)) {
        throw new Error(`Fixture ${type} does not have a fromPartial method`);
      }
      fixture = await (fixtureClass.fromPartial as FixtureGenerator<any, any, any>)(prisma, data, resolvedRelations);
    } catch (error) {
      console.error(` ⚠️  Warning: Failed to create ${type}:`, error);
      continue;
    }

    if (data.email && data.password) {
      console.log(` 🔑 ${type} created successfully: ${data.email} with password: ${data.password}`);
    }

    if (!(type in seededData)) {
      seededData[type] = [];
    }
    seededData[type].push(fixture);
  }

  console.log(` ✅ Seeded ${Object.values(seededData).reduce((acc, curr) => acc + curr.length, 0)} entities`);

  await prisma.$disconnect();
}

// if this file was run directly
if (import.meta.url === new URL(import.meta.url).href) {
  seed().catch(console.error);
}
