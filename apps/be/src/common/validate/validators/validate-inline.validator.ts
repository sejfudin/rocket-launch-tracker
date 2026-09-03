import { type ValidationArguments, type ValidationOptions, registerDecorator } from 'class-validator';

export function ValidateInline(
  func: ({ object, value }: { object: unknown; value: unknown }) => Promise<boolean> | boolean,
  validationOptions?: ValidationOptions,
) {
  return function _ValidateInline(object: object, propertyName: string) {
    registerDecorator({
      name: 'validateInline',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [func],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const constraints = args.constraints as [typeof func];
          return constraints[0]({ object: args.object, value });
        },
      },
    });
  };
}
