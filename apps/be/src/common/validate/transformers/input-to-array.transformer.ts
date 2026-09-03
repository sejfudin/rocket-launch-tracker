import { Transform } from 'class-transformer';

function transformInputToArrayFn<T = string>(
  options: { transformer?: (value: string) => T; separator?: string; unique?: boolean } = {},
) {
  const transformerFn = options.transformer || ((v: string) => v as unknown as T);
  const separator = options.separator || ',';
  const unique = options.unique;

  return (payload: { value: unknown }): T[] | undefined => {
    let value: unknown = payload.value;

    if (typeof value === 'string') {
      if (value === '') {
        return undefined;
      }
      if (value.match(/^\[.*]$/)) {
        // json
        value = JSON.parse(value) as unknown[];
      } else {
        // simple comma separated
        value = value.split(separator || ',').map((element) => element.trim());
      }
    } else if (!Array.isArray(value)) {
      /**
       * Transformations should return the original value if the transformation is not possible
       */
      return value as T[] | undefined;
    }

    const result = (value as string[]).map((e: string) => (transformerFn ? transformerFn(e) : (e as unknown as T)));

    if (unique) {
      return [...new Set(result)];
    }

    return result;
  };
}

export function TransformInputToArray(options?: Parameters<typeof transformInputToArrayFn>[0]): PropertyDecorator {
  return Transform(transformInputToArrayFn(options));
}
