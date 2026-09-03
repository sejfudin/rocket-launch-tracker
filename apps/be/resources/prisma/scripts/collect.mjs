
/**
 * Gather all changed .prisma files from src/ that are not ignored in tsconfig
 *
 *   yarn tsx src/database/prisma/scripts/collect.ts
 */

import { existsSync, globSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'url';

// hide experimental warning
process.removeAllListeners('warning');

const root = join(__dirname, '../../../');
const prismaSchemaDir = join(root, 'resources/prisma/schema');

export function collect() {
  const { exclude } = createRequire(root)('./tsconfig.json');

  // Track which resolved files should exist
  const expectedResolvedFiles = new Set();

  for (const { name, parentPath } of globSync(join(root, 'src/**/*.prisma'), {
    withFileTypes: true,
    exclude: (d) => {
      const filePath = join(d.parentPath, d.name);
      if (d.name === 'schema.prisma') return true;
      return exclude.some((pattern) => {
        const regexPattern = pattern.replace(/\*/g, '.*').replace(/\./g, '\\.');
        return new RegExp(regexPattern).test(filePath);
      });
    },
  })) {
    const originalPath = join(parentPath, name);
    const tmpSchemaPath = join(prismaSchemaDir, name.replace('.prisma', '.resolved.prisma'));
    expectedResolvedFiles.add(tmpSchemaPath);
    const header = `// DO NOT EDIT\n// File was generated from ./${relative(root, originalPath)}\n\n`;
    const originalFileContent = header + readFileSync(originalPath, 'utf-8');
    if (existsSync(tmpSchemaPath)) {
      if (header + readFileSync(tmpSchemaPath, 'utf-8') === originalFileContent) {
        continue;
      }
    }
    writeFileSync(tmpSchemaPath, originalFileContent);
  }

  // Remove any .resolved.prisma files that are no longer detected
  if (existsSync(prismaSchemaDir)) {
    for (const resolvedFile of globSync(join(prismaSchemaDir, '*.resolved.prisma'))) {
      if (!expectedResolvedFiles.has(resolvedFile)) {
        unlinkSync(resolvedFile);
      }
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  collect();
}
