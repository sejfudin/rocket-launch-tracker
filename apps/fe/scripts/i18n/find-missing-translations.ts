/* oxlint-disable no-console */
import * as fs from "fs";
import * as path from "path";

const defaultLang = "en";
const argPrefix = "--lang=";
const langArg = process.argv.find((arg) => arg.startsWith(argPrefix));

const langValue = langArg?.split(argPrefix)[1];
const lang = langValue && fs.existsSync(`./src/config/locales/${langValue}`) ? langValue : defaultLang;

if (langValue && lang === defaultLang) {
  console.error(`The language "${langValue}" does not exist. Defaulting to "${defaultLang}".`);
}

const SRC_DIR = "src";

const translationKeysInCode = new Set<string>();

const traverseDirectory = (dir: string): void => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDirectory(fullPath);
    } else if (/\.(jsx?|tsx?)$/i.test(file)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      const matches = content.match(/(^|\W)t\(['"](.+?)['"]\)/g);
      if (matches) {
        matches.forEach((match) => {
          const key = /t\(['"](.+?)['"]\)/.exec(match)?.[1];
          if (key) {
            translationKeysInCode.add(key);
          }
        });
      }
    }
  }
};
traverseDirectory(SRC_DIR);

const getAllTranslationKeys = (obj: any, prefix = ""): string[] => {
  const keys: string[] = [];
  for (const key in obj) {
    if (typeof obj[key] === "object") {
      keys.push(...getAllTranslationKeys(obj[key], `${prefix}${key}.`));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
};

import(`../../src/config/locales/${lang}/translation`)
  .then((translations) => {
    const allTranslationKeys = new Set(getAllTranslationKeys(translations.default));
    const missingKeys = Array.from(translationKeysInCode).filter((key) => !allTranslationKeys.has(key));
    if (missingKeys.length > 0) {
      console.log("Missing translation keys:", missingKeys);
    } else {
      console.log("No missing translation keys found.");
    }
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
