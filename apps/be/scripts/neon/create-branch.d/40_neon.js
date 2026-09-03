#!/usr/bin/env node

const { resolveConfigSync } = require('@povio/resolve-config');

const BASE_URL = 'https://console.neon.tech/api/v2';

const api = async (url, options = {}) => {
  const res = await fetch(url, options);
  return { ok: res.ok, data: await res.json() };
};

/**
 *
 * @param {*} options
 * @param {string} options.verbose - The name of the branch to create
 * @param {string} options.projectId - The project ID to create the branch in
 * @param {string} options.parentId - The base branch to create the branch from
 * @param {string} options.databaseName - Database name
 * @param {string} options.roleName - Role name
 * @param {string} options.branchName - The name of the branch to create
 * @param {string} options.apiKey - The API key to use to create the branch
 * @returns {Promise<string>}
 */
async function getDatabaseUrl(options = {}) {
  const config = resolveConfigSync({
    stage: process.env.STAGE,
    module: `config`,
    target: 'resolved',
  });

  const projectId = options.projectId ?? config.neon?.projectId;
  const parentId = options.parentId ?? config.neon?.parentId;
  const branchName = options.branchName ?? config.neon?.branchName;
  const apiKey = options.apiKey ?? config.neon?.apiKey;
  const databaseName = options.databaseName ?? config.neon?.databaseName;
  const roleName = options.roleName ?? config.neon?.roleName;

  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

  const missingKeys = Object.entries({ projectId, parentId, branchName, apiKey }).filter(([, v]) => !v);
  if (missingKeys.length > 0) {
    return { error: `Missing required config: ${missingKeys.join(', ')}` };
  }

  if (options.verbose) console.log(`# ⏳ Creating branch '${branchName}' from '${parentId}'`);

  const create = await api(`${BASE_URL}/projects/${projectId}/branches`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      branch: {
        name: branchName,
        parent_id: parentId,
        project_id: projectId,
        // 2 weeks in the future
        expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      endpoints: [{ type: 'read_write' }],
    }),
  });

  let branchId, endpointId, state;

  if (!create.ok || create.data.code) {
    if (create.data.message?.includes('already exists')) {
      if (options.verbose) console.log('# ✅ Branch exists');
      const branches = await api(`${BASE_URL}/projects/${projectId}/branches`, { headers });
      const endpoints = await api(`${BASE_URL}/projects/${projectId}/endpoints`, { headers });

      branchId = branches.data.branches?.find((b) => b.name === branchName)?.id;
      const endpoint = endpoints.data.endpoints?.find((e) => e.branch_id === branchId);
      endpointId = endpoint?.id;
      state = endpoint?.current_state;
    } else {
      return { error: create.data.message || create.data.error };
    }
  } else {
    branchId = create.data.branch.id;
    endpointId = create.data.endpoints[0].id;
  }

  if (!branchId || !endpointId) {
    return { error: 'Failed to get branch/endpoint ID' };
  }

  if (state !== 'active' && state !== 'idle') {
    if (options.verbose) console.log(`# ⏳ Waiting for endpoint ${endpointId}...`);
    for (let i = 0; i < 30; i++) {
      const status = await api(`${BASE_URL}/projects/${projectId}/endpoints/${endpointId}`, { headers });
      const state = status.data.endpoint?.current_state;

      if (state === 'active' || state === 'idle') {
        if (options.verbose) console.log('# ✅ Endpoint ready');
        break;
      }

      if (i >= 29) {
        return { error: 'Timeout waiting for endpoint' };
      }

      if (options.verbose) console.log(`# ⏳ Status: ${state} (${i + 1}/30)`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  if (options.verbose)
    console.log(`# ⏳ Getting connection string for user '${roleName}' on database '${databaseName}'`);
  const conn = await api(
    `${BASE_URL}/projects/${projectId}/connection_uri?branch_id=${branchId}&endpoint_id=${endpointId}&database_name=${databaseName}&role_name=${roleName}`,
    { headers },
  );

  const url = conn.data.uri;
  if (!url) {
    return { error: 'Failed to get connection string' };
  }

  return { url };
}

if (require.main === module) {
  getDatabaseUrl({
    verbose: true,
    projectId: process.env.NEON_PROJECT_ID,
    parentId: process.env.NEON_PARENT_ID,
    branchName: process.env.NEON_BRANCH_NAME,
    databaseName: process.env.NEON_DATABASE_NAME,
    roleName: process.env.NEON_ROLE_NAME,
    apiKey: process.env.NEON_API_KEY,
  })
    .then((result) => {
      if (result.error) {
        console.error('# ❌ Error:', result.error);
        process.exit(1);
      }
      console.log(`DATABASE_URL=${result.url}`);
    })
    .catch((err) => {
      console.error('# ❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = {
  getDatabaseUrl,
};
