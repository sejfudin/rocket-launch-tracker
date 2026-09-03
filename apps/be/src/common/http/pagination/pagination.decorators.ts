import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested, type ValidationOptions } from 'class-validator';

import { TransformInputToPaginationOrder } from '~common/http/pagination/transformers/input-to-pagination-order.transform';

import { PaginationDto } from './dtos/pagination.dto';
import { IsPaginationOrder } from './validators/pagination-order.validator';

// oxlint-disable-next-line no-unsafe-function-type
export const ApiPaginationResponse = (model: Function) => {
  return applyDecorators(
    ApiExtraModels(PaginationDto),
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationDto) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};

export function PaginationOrder<T extends Record<string, string | number>>(
  enumConstraint: T,
  validationOptions?: ValidationOptions,
) {
  const enumKeys = Object.keys(enumConstraint);

  return applyDecorators(
    TransformInputToPaginationOrder(),
    IsPaginationOrder(enumConstraint, validationOptions),
    ApiPropertyOptional({
      type: String,
      example: enumKeys.length ? enumKeys[0] : '',
      description: `Order by fields (comma separated with +/- prefix): ${enumKeys.join(', ')}`,
      'x-enumNames': enumKeys,
    }),
  );
}

export function PaginationFilter<T extends new () => unknown>(filterDto: T) {
  return applyDecorators(
    ApiPropertyOptional({
      style: 'deepObject',
      explode: true,
    } as Record<string, unknown>),
    Type(() => filterDto),
    ValidateNested(),
  );
}
