import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class EmailWithOptionalNameConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    // Regex to match 'Name Surname <email@example.com>', '<email@example.com>', or 'email@example.com'
    const emailRegex = /^(?:[a-zA-Z\s]+<)?\S+@\S+\.\S+>?$/;
    return typeof value === 'string' && emailRegex.test(value);
  }

  defaultMessage() {
    return 'Email must be in the format "email@example.com" or "Name Surname <name.surname@example.com>"';
  }
}

export function IsEmailWithOptionalName(validationOptions?: ValidationOptions) {
  return function _IsEmailWithOptionalName(object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailWithOptionalNameConstraint,
    });
  };
}
