#!/usr/bin/env zx

import { $ } from "zx";

await $`turbo telemetry disable`.quiet();
