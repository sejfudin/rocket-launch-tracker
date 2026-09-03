#!/usr/bin/env node

if (process.env.HEROKU_BRANCH && process.env.HEROKU_APP_NAME && process.env.HEROKU_BRANCH !== 'develop') {
  const { setTemplate } = require('@povio/resolve-config');

  setTemplate({
    stage: process.env.STAGE,
    module: 'api.override',
    data: {
      core: {
        apiBaseUrl: `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`,
        webBaseUrl: `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`,
      },
      admin: {
        auth: {
          redirectUrl: `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/admin/auth/callback`,
        },
      },
      user: {
        auth: {
          redirectUrl: `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/auth/callback`,
        },
      },
    },
  });
}
