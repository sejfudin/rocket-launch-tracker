import { type ValidationArguments, type ValidationOptions, registerDecorator } from 'class-validator';

import { type IPaginationOrder } from '../pagination.types';

export function IsPaginationOrder<T extends Record<string, string | number>>(
  enumConstraint: T,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function _IsPaginationOrder(object: object, propertyName: string | symbol) {
    registerDecorator({
      name: 'validatePaginationOrder',
      target: object.constructor,
      propertyName: propertyName.toString(),
      constraints: [enumConstraint],
      options: validationOptions,
      validator: {
        validate(value: IPaginationOrder<string | number>[], args: ValidationArguments) {
          const [enumConstraint] = args.constraints as [Record<string, string | number>];
          return (
            Array.isArray(value) &&
            value.every(
              (order) =>
                Object.keys(enumConstraint).includes(String(order.property)) &&
                ['asc', 'desc'].includes(order.direction),
            )
          );
        },
      },
    });
  };
}
