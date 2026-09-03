# Custom icons with SVGR

In case you want to host svg icons inside the repository, you can convert them to React components using svgr. An example config and a component template are provided below.

Example config:

```ts
import { template } from "./component-template.js";
import { join } from "node:path";
import { cwd } from "node:process";

export default {
  icon: true,
  expandProps: "end",
  outDir: join(cwd(), "src/assets/icons"),
  jsxRuntime: "automatic",
  ignoreExisting: false,
  typescript: true,
  prettier: false,
  svgProps: {
    className: "fill-current",
  },
  dimensions: false,
  index: false,
  template,
  replaceAttrValues: {
    "#000": "currentColor",
    "#000000": "currentColor",
    "#00000000": "transparent",
    "#fff": "currentColor",
    "#ffffff": "currentColor",
    "#ffffff00": "transparent",
  },
};
```

Example component template:
```ts
export const template = (variables, { tpl }) => {
  return tpl`
${variables.imports}
export const ${`${variables.componentName.slice(3)}Icon`} = (${variables.props}) => (
${variables.jsx}
);
`;
};
```

```bash
npx @svgr/cli --config-file [PATH_TO_CONFIG] -- [INPUT_FOLDER_PATH] && biome format --write [OUTPUT_FOLDER_PATH]
```
