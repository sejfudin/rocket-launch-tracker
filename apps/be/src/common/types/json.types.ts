/**
 * JSON-compatible primitive type
 */
export type JsonPrimitive = string | number | boolean | null;

/**
 * JSON-compatible value type
 */
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

/**
 * JSON-compatible object type
 */
export interface JsonObject {
  [key: string]: JsonObject | JsonValue;
}

/**
 * JSON like value but with undefined
 */
export type JsonUValue = JsonPrimitive | JsonUValue[] | { [key: string]: JsonUValue } | undefined;

/**
 * JSON like object but with undefined
 */
export interface JsonUObject {
  [key: string]: JsonUObject | JsonUValue;
}
