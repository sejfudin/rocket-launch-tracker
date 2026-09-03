import { applyDecorators } from '@nestjs/common';
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';

import type { JsonObject } from '~common/types';

export interface ApiFieldDefinitionBase {
  type: string;
}

export interface ApiFieldReferenceInputDefinition extends ApiFieldDefinitionBase {
  type: 'reference-input';
  /**
   * OperationId of provider API endpoint
   */
  reference: string;
  /**
   * Field used to display a label
   * @default 'name'
   */
  optionText?: string;
  /**
   * Field used to display a label
   * @default 'id'
   */
  optionValue?: string;
  /**
   * Query options used while fetching items
   */
  query?: { order?: string[]; filter: JsonObject };
}

export interface ApiFieldReferenceManyInputDefinition extends Omit<ApiFieldReferenceInputDefinition, 'type'> {
  type: 'reference-array-input';
}

export type ApiFieldDefinition = ApiFieldReferenceInputDefinition | ApiFieldReferenceManyInputDefinition;

/**
 * ApiField decorator that exposes field definitions in Swagger
 * Can be called with a single field definition object or an array of field definitions
 * Multiple decorators will append all definitions together
 */
export function ApiField(field: ApiFieldDefinition) {
  switch (field.type) {
    case 'reference-input':
    case 'reference-array-input':
      if (!field.optionValue) {
        field.optionValue = 'id';
      }
      if (!field.optionText) {
        field.optionText = 'name';
      }
      break;
  }

  return applyDecorators(ApiProperty({ 'x-field': field } as ApiPropertyOptions));
}
