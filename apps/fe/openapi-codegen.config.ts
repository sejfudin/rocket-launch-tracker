import type { OpenAPICodegenConfig } from "@povio/openapi-codegen-cli";

const config: OpenAPICodegenConfig = {
  input: "../be/resources/openapi-main.json",
  output: "src/openapi",
  replaceOptionalWithNullish: true,
  tsPath: "@/openapi",
  errorHandlingImportPath: "@povio/ui",
  abilityContextImportPath: "@povio/ui/auth",
  queryTypesImportPath: "@povio/ui",
  restClientImportPath: "@/clients/app-rest-client",
  abilityContextGenericAppAbilities: true,
  infiniteQueries: true,
  builderConfigs: true,
};

export default config;
