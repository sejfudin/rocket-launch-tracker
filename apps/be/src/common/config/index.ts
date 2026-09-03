/**
 * A simple configuration loader build on top of [ResolveConfig](https://www.npmjs.com/package/@povio/resolve-config) for loading
 * resolved configuration from the file system.
 *
 * The configuration is loaded on first use, and is stored in memory raw. Once a module requests the configuration,
 * it is resolved, validated, cached and returned.
 *
 *  **For a configuration file**
 *  ```yaml
 *  s3:
 *    bucket: my-bucket
 *  ```
 *
 *  **You can create a class**
 *  ```typescript
 *  @ConfigDecorator('s3')
 *  export class S3Config {
 *    bucket!: string;
 *  }
 *  ```
 *
 *  **Use it in a module**
 *  ```typescript
 *  @Module({ providers: [ getConfigFactory(S3Config) ] })
 *  export class AppModule {}
 *  ```
 *
 *  **Or use it directly**
 *  ```typescript
 *  const s3Config = getConfig(S3Config);
 *  ```
 */

import { resolveConfigSync } from '@povio/resolve-config';
import { type ClassConstructor } from 'class-transformer';

import { plainToValidatedInstance } from '~common/validate/plain-to-instance';

/**
 * Global default raw configuration object
 *  do not use directly, use loadConfig with a typed config instead
 */
const rawConfig = resolveConfigSync({
  stage: process.env.STAGE,
  module: `config`,
  target: 'resolved',
});

const configCache = new Map<string, unknown>();

export function ConfigDecorator(configKey: string) {
  // oxlint-disable-next-line no-explicit-any
  return function _ConfigDecorator(cls: any) {
    (cls as { __config_key: string }).__config_key = configKey;
    return cls;
  };
}

/**
 * Get a raw configuration object
 *  use getConfig instead
 */
export function getRawConfig<T extends object>(cls: ClassConstructor<T>, _configKey?: string): T {
  const configKey = _configKey ?? (cls as unknown as { __config_key: string }).__config_key;

  if (!configKey) {
    throw new Error(`${cls.name} class missing @ConfigDecorator`);
  }

  let configNode: Record<string, unknown> = rawConfig as Record<string, unknown>;

  for (const key of configKey.split('.')) {
    if (configNode[key] && typeof configNode[key] === 'object') {
      configNode = configNode[key] as Record<string, unknown>;
    } else {
      return {} as T;
    }
  }

  return configNode as T;
}

/**
 * Get a typed and resolved configuration object
 */
export function getConfig<T extends object>(cls: ClassConstructor<T>): T {
  // one config per class and namespace
  const configKey = (cls as unknown as { __config_key: string }).__config_key;

  if (!configKey) {
    throw new Error(`${cls.name} class missing @ConfigDecorator`);
  }

  const cacheKey = `${configKey}:${cls.name}`;

  if (configCache.has(cacheKey)) {
    return configCache.get(cacheKey) as T;
  }

  const config = plainToValidatedInstance(cls, getRawConfig(cls));
  configCache.set(cacheKey, config);
  return config;
}

/**
 * Factory provider for a configuration class
 *  provides a validated and resolved configuration object
 * @param cls
 */
export function getConfigFactory<T extends object>(cls: ClassConstructor<T>) {
  return {
    provide: cls,
    useFactory: () => getConfig(cls),
  };
}
