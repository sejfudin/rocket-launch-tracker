#!/usr/bin/env zx

import { $ } from 'zx';

await $`openapi-codegen check --input resources/openapi-main.json`.quiet();
await $`openapi-codegen check --input resources/openapi-admin.json`.quiet();
