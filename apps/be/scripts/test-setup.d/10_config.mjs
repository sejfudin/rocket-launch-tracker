#!/usr/bin/env zx

import { $ } from 'zx';

$.env.STAGE = 'test';

await $`resolve-config apply --module config`;
