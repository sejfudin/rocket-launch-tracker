import 'reflect-metadata';

import { Expose, Type, plainToInstance } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
} from 'class-validator';
import { describe, it } from 'vitest';

import { JsonObject } from '~common/types';

import { TransformInputToArray } from './transformers/input-to-array.transformer';
import { TransformInputToBoolean } from './transformers/input-to-boolean.transformer';
import { IsJsonObject } from './validators/validate-json-object.validator';

enum AnEnum {
  A = 'A',
  B = 'B',
  C = 'C',
}

export class AnDto {
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @TransformInputToArray({ transformer: String })
  ar1?: string[];

  @Expose()
  @IsArray()
  @IsString({ each: true })
  @TransformInputToArray({ transformer: String })
  ar2: string[] = ['the', 'default'];

  @Expose()
  @IsArray()
  @IsNumber({}, { each: true })
  @TransformInputToArray({ transformer: Number })
  ar3: number[] = [1, 2];

  @Expose()
  @IsArray()
  @IsNumber({}, { each: true })
  @TransformInputToArray({ transformer: Number, separator: ';' })
  ar4: number[] = [1, 2];

  @Expose()
  @IsArray()
  @IsUUID('all', { each: true })
  @TransformInputToArray()
  ar5!: string[];

  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  bol1 = false;

  @Expose()
  @IsBoolean()
  @IsOptional()
  @TransformInputToBoolean()
  bol2!: boolean;

  @Expose()
  @Type(() => Boolean)
  @IsBoolean()
  bol3!: boolean;

  @Expose()
  @IsBoolean()
  @TransformInputToBoolean()
  bol4 = true;

  @Expose()
  @IsUUID('4')
  uuid1!: string;

  @Expose()
  @IsString()
  str1!: string;

  @Expose()
  @Type(() => Number)
  @IsNumber()
  num1!: number;

  @Expose()
  @Type(() => Date)
  @IsDate()
  date1!: Date;

  @Expose()
  @IsEnum(AnEnum)
  enum1!: AnEnum;

  @Expose()
  @IsJsonObject()
  json1!: JsonObject;

  @Expose()
  @IsJsonObject()
  @IsOptional()
  json2?: JsonObject;
}

function testClassValidator(
  dto: any,
  data: Record<
    string,
    {
      value?: any;
      transformed?: boolean;
      value2?: any;
      constraints?: any;
    }
  >,
  expect: any,
) {
  const transformedObject = Object.fromEntries(
    Object.entries(data)
      .filter(([, { value }]) => value !== undefined)
      .map(([property, { value }]) => [property, value]),
  );

  const instance = plainToInstance(dto, transformedObject, {
    exposeDefaultValues: true,
    exposeUnsetFields: false,
    strategy: 'excludeAll',
  });

  expect(instance).toEqual(
    Object.fromEntries(
      Object.entries(data).map(([property, obj]) => [property, obj.transformed ? obj.value2 : obj.value]),
    ),
  );

  const issues = validateSync(instance as any, { whitelist: true, forbidNonWhitelisted: true });

  expect(issues).toEqual(
    expect.arrayContaining(
      Object.entries(data)
        .filter(([, { constraints }]) => constraints)
        .map(([key, { constraints }]) => expect.objectContaining({ property: key, constraints })),
    ),
  );

  const keysWithIssues = new Set(
    Object.entries(data)
      .filter(([, { constraints }]) => constraints)
      .map(([key]) => key),
  );

  expect(issues.filter(({ property }) => !keysWithIssues.has(property))).toEqual([]);
}

describe('ClassValidator', () => {
  it('ClassValidator Happy Path', ({ expect }) => {
    testClassValidator(
      AnDto,
      {
        ar1: { value: 'hello, world', transformed: true, value2: ['hello', 'world'] },
        ar2: { transformed: true, value2: ['the', 'default'] },
        ar3: { value: '4.3, 5.1', transformed: true, value2: [4.3, 5.1] },
        ar4: {
          value: '4.3, 5.1',
          transformed: true,
          value2: [NaN],
          constraints: { isNumber: 'each value in ar4 must be a number conforming to the specified constraints' },
        },
        ar5: {
          value: '082b5f86-ac6d-4819-bec4-98d14105aacd',
          transformed: true,
          value2: ['082b5f86-ac6d-4819-bec4-98d14105aacd'],
        },
        bol1: { value: 'true', transformed: true, value2: true },
        bol2: { value: true },
        bol3: { value: true },
        bol4: { value: false, transformed: false, value2: false },
        uuid1: { value: '082b5f86-ac6d-4819-bec4-98d14105aacd' },
        str1: { value: 'an string' },
        num1: { value: '1', transformed: true, value2: 1 },
        date1: {
          value: '2000-10-31T01:30:00.000-05:00',
          transformed: true,
          value2: new Date('2000-10-31T06:30:00.000Z'),
        },
        enum1: { value: 'A' },
        json1: {
          value: { key: 'value', nested: { a: 1 } },
        },
        json2: { value: { another: 'object' } },
      },
      expect,
    );
  });

  it('ClassValidator Invalid Input', ({ expect }) => {
    testClassValidator(
      AnDto,
      {
        ar1: { value: 'hello; world', transformed: true, value2: ['hello; world'] },
        ar2: { transformed: true, value2: ['the', 'default'] },
        ar3: {
          value: '4.a3, 5.1',
          transformed: true,
          value2: [NaN, 5.1],
          constraints: { isNumber: 'each value in ar3 must be a number conforming to the specified constraints' },
        },
        ar4: {
          value: '4.3, 5.1',
          transformed: true,
          value2: [NaN],
          constraints: { isNumber: 'each value in ar4 must be a number conforming to the specified constraints' },
        },
        ar5: {
          value: '082b5f86-ac6d-4819-bec4-98d14105aacd',
          transformed: true,
          value2: ['082b5f86-ac6d-4819-bec4-98d14105aacd'],
        },
        bol1: { value: 'f', transformed: true, value2: false },
        bol2: { value: false },
        bol3: { value: false },
        bol4: { value: undefined, transformed: true, value2: true },
        uuid1: { value: '082b5fad14105aacd', constraints: { isUuid: 'uuid1 must be a UUID' } },
        str1: { value: 5, constraints: { isString: 'str1 must be a string' } },
        num1: { value: 1 },
        date1: {
          value: '2000-10-31',
          transformed: true,
          value2: new Date('2000-10-31'),
        },
        enum1: { value: 'G', constraints: { isEnum: 'enum1 must be one of the following values: A, B, C' } },
        json1: { value: 'not an object', constraints: { isJsonObject: 'json1 must be a plain object' } },
        json2: { value: ['array', 'not', 'object'], constraints: { isJsonObject: 'json2 must be a plain object' } },
      },
      expect,
    );
  });
});
