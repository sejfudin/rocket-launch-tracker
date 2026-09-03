#!/usr/bin/env zx

import { $ } from 'zx';

$.env.PRISMA_HIDE_UPDATE_MESSAGE = '1';
$.env.CHECKPOINT_DISABLE = '1';

await $`npx prisma generate --no-hints`;
