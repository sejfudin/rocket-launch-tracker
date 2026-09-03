#!/usr/bin/env zx

import { $ } from "zx";

// generate OpenAPI data layer
await $`openapi-codegen generate`;
