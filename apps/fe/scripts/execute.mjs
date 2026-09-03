#!/usr/bin/env zx

import { path } from "zx";

import { runScripts } from "../../../scripts/execute.helper.mjs";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");

await runScripts(ROOT_DIR);
