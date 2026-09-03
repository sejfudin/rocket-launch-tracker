#!/usr/bin/env node

if (process.env.NEON_API_KEY) {
  const { setTemplate } = require('@povio/resolve-config');
  const { getDatabaseUrl } = require('../neon/create-branch.d/40_neon');

  getDatabaseUrl({
    verbose: true,
    projectId: process.env.NEON_PROJECT_ID,
    parentId: process.env.NEON_PARENT_ID,
    branchName: process.env.NEON_BRANCH_NAME || process.env.HEROKU_APP_NAME,
    databaseName: process.env.NEON_DATABASE_NAME,
    roleName: process.env.NEON_ROLE_NAME,
    apiKey: process.env.NEON_API_KEY,
  })
    .then((result) => {
      if (result.error) {
        console.error('# ❌ Error:', result.error);
        process.exit(1);
      }
      setTemplate({
        stage: process.env.STAGE,
        module: 'api.override',
        data: {
          prisma: {
            url: result.url,
          },
        },
      });
    })
    .catch((err) => {
      console.error('# ❌ Error:', err.message);
      process.exit(1);
    });
}
