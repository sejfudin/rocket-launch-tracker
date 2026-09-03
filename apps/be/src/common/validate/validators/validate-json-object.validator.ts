import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { type ValidationArguments, type ValidationOptions, registerDecorator } from 'class-validator';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Validates that the property is a plain JavaScript object (POJO).
 * Also applies:
 * - `@Transform` to preserve the raw object value (prevents stripping with excludeAll strategy)
 * - `@ApiProperty({ additionalProperties: { type: 'any' } })` for OpenAPI documentation
 */
export function IsJsonObject(validationOptions?: ValidationOptions): PropertyDecorator {
  return applyDecorators(
    Transform(({ obj, key }) => obj[key], { toClassOnly: true }),
    ApiProperty({ additionalProperties: { type: 'any' } }),
    function _IsJsonObject(target: object, propertyName: string | symbol) {
      registerDecorator({
        name: 'isJsonObject',
        target: target.constructor,
        propertyName: propertyName.toString(),
        options: {
          message: `$property must be a plain object`,
          ...validationOptions,
        },
        validator: {
          validate(value: unknown, _args: ValidationArguments): boolean {
            return isPlainObject(value);
          },
        },
      });
    } as PropertyDecorator,
  );
}
