import { Transform } from 'class-transformer';

function transformInputToBooleanFn(payload: { value: unknown }): boolean | undefined {
  const { value } = payload;

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  if (typeof value !== 'string') {
    /**
     * Transformations should return undefined if the transformation is not possible
     */
    return undefined;
  }

  if (['true', 't', 'yes', '1'].includes(value.toLowerCase())) {
    return true;
  }

  if (['false', 'f', 'no', '0'].includes(value.toLowerCase())) {
    return false;
  }

  return undefined;
}

export function TransformInputToBoolean(): PropertyDecorator {
  return Transform(transformInputToBooleanFn);
}
