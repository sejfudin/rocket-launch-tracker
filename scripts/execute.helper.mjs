#!/usr/bin/env zx

import { $, argv, cd, chalk, echo, glob, path } from "zx";

import { fileURLToPath } from "node:url";

$.preferLocal = true;
$.verbose = true;

/**
 * @param rootDir {string}
 */
export async function runScripts(rootDir) {
  cd(rootDir);

  const startIdx = argv._[0]?.match(/scripts/) ? 1 : 0;
  const directory = argv._[startIdx];
  const rest = argv._.slice(startIdx + 1);

  if (!directory) {
    echo(chalk.gray("Usage: yarn script <command> [args...]"));
    echo(chalk.yellow("Available commands:"));
    const commandDirs = await glob("scripts/*.d/", { absolute: false, onlyDirectories: true });
    for (const command of commandDirs.map((dir) => path.basename(dir, ".d")).sort()) {
      echo(chalk.cyan(` ${command}`));
    }
    process.exit(0);
  }

  $.env.STAGE ||= argv.stage || "local";

  const scripts = (await glob(`scripts/${directory}.d/*_*.{mts,js,mjs,sh}`, { absolute: true })).sort();

  if (scripts.length === 0) {
    echo(chalk.red(`Error: No scripts found in scripts/${directory}.d/`));
    process.exit(1);
  }

  for (const script of scripts) {
    const relativePath = path.relative(path.join(rootDir), script);
    echo(chalk.gray(`>> ${relativePath}`));
    const ext = path.extname(script);

    if ([".mjs", ".js", ".cjs", ".ts", ".cts", ".mts"].includes(ext)) {
      await import(new URL(`file:///${script}`));
    } else if (ext === ".sh") {
      await $`bash ${script} ${rest}`;
    }
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const ROOT_DIR = $.env.ROOT_DIR || path.resolve(import.meta.dirname, "..");

  await runScripts(ROOT_DIR);
}
