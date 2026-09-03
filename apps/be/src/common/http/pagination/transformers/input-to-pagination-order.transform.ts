import { Transform } from 'class-transformer';

import { type IPaginationOrder, type IPaginationOrderDirection } from '../pagination.types';

export function transformInputToPaginationOrder(key: string | symbol = 'order') {
  return (input: {
    value: string | string[];
    obj?: Record<string, Record<string, string>>;
  }): IPaginationOrder<string>[] | undefined => {
    if (!input.value) {
      return undefined;
    }

    if (typeof input.value === 'string' || Array.isArray(input.value)) {
      /**
       * Collect all items of `order=`, split by comma\
       *  - ?order=field1,-field2,field3&order=field4
       */
      return (Array.isArray(input.value) ? input.value : [input.value])
        .map((i) => i.split(','))
        .flat()
        .map((x: string) => x.trim())
        .map((i) => {
          return {
            property: i.replace(/^[-+]/, ''),
            direction: (i.startsWith('-') ? 'desc' : 'asc') as IPaginationOrderDirection,
          };
        });
    }

    /**
     * Collect ?order[field]=desc|asc
     *  - this could be non-deterministic
     */
    if (input.obj && String(key) in input.obj) {
      const orderObj = input.obj[String(key)];
      return Object.entries(orderObj).reduce((acc, [property, direction]) => {
        if (['asc', 'desc'].includes(direction)) {
          acc.push({ property, direction: direction as IPaginationOrderDirection });
        }
        return acc;
      }, [] as IPaginationOrder<string>[]);
    }

    return undefined;
  };
}

export function TransformInputToPaginationOrder(): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    Transform(transformInputToPaginationOrder(propertyName))(target, propertyName);
  };
}
