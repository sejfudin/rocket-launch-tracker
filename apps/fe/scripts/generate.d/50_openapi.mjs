#!/usr/bin/env zx

import { $ } from "zx";

await $`rimraf ./src/openapi`;

await $`openapi-codegen generate`;
