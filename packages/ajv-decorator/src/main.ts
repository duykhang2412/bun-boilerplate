import type { ErrorObject } from 'ajv';
import type { Context, MiddlewareHandler, ValidationTargets } from 'hono';
import { OpenAPIV3 } from 'openapi-types';
import { ajv, handleErrors } from './decorator';
import { validator } from 'hono/validator';
import { uniqueSymbol } from 'hono-openapi';

type AjvResult =
  | { success: true; data: unknown }
  | { success: false; error: ErrorObject[] };

type AjvHook = (
  result: AjvResult,
  c: Context,
) => Response | Promise<Response> | void | Promise<void>;

function coerceArrayFields(data: any, schema: any) {
  if (schema.type === 'object' && schema.properties) {
    for (const key in schema.properties) {
      const propSchema = schema.properties[key];
      const value = data[key];

      if (propSchema.type === 'array') {
        if (value !== undefined && !Array.isArray(value)) {
          data[key] = [value];
        }
      } else if (propSchema.type === 'object' && value !== undefined) {
        coerceArrayFields(value, propSchema);
      }
    }
  }
}

export function transform(data: Record<string, unknown>, schema: Record<string, unknown>) {
  const keys = Object.keys(data);

  coerceArrayFields(data, schema);

  keys.map(key => {
    if (key.includes('[]')) {
      let dataProp = data[key];
      delete data[key];
      if (typeof dataProp === 'string') {
        dataProp = [dataProp];
      }

      key = key.replace('[]', '');
      data[key] = dataProp;
    }
  })
}
/**
 * Tạo middleware xác thực bằng AJV
 * @param target Vị trí cần xác thực (json, query, param, ...)
 * @param schema JSON Schema dùng cho AJV
 * @param hook Hook tùy chọn để xử lý kết quả xác thực
 * @returns Middleware handler cho Hono
 */
export function ajvValidator(
  target: keyof ValidationTargets,
  schema: any,
  hook?: AjvHook,
  metakey?: string,
): MiddlewareHandler {

  const middleware = validator(target, async (data, c) => {
    if (target === 'query') {
      transform(data, schema);
    }
    delete schema.$id;
    const validate = ajv.compile(schema);

    const valid = validate(data);
    const result: AjvResult = valid
      ? { success: true, data: data }
      : { success: false, error: validate.errors || [] };

    if (hook) {
      const hookResult = await hook(result, c);
      if (hookResult instanceof Response) {
        return hookResult;
      }
    }

    const errors: ErrorObject[] | null | undefined = validate.errors;
    if (errors) {
      console.log(`===================================Error validate: ${JSON.stringify(errors, null, 2)}`)
      const rs = handleErrors(errors);
      return c.json(
        rs,
        200,
      );
    } else {
      if (metakey) {
        c.set(metakey, data);
      }
    }
  })

  return Object.assign(middleware, {
    [uniqueSymbol]: {
      resolver: async () => generateAjvValidatorDocs(target, schema),
      metadata: { schemaType: 'input' },
    },
  });
}

export async function generateAjvValidatorDocs<
  Target extends keyof ValidationTargets,
>(target: Target, schema: any) {
  if (target === 'header') {
    return { components: {} };
  }
  const docs: Partial<OpenAPIV3.OperationObject & { properties: Array<unknown> }> = schema;

  // docs.parameters = [];
  docs.requestBody = undefined;
  // delete docs.properties;

  // Với các target như "query" hoặc "param", chuyển schema thành parameters.
  const parameters: (
    | OpenAPIV3.ReferenceObject
    | OpenAPIV3.ParameterObject
  )[] = [];

  // Nếu schema có $ref và $ref là string, dùng trực tiếp để tham chiếu.
  if ('$ref' in schema && typeof (schema as any).$ref === 'string') {

    if (target === 'json') {
      docs.requestBody = {
        content: {
          'application/json': {
            schema: schema as OpenAPIV3.SchemaObject
          }
        }
      }
    } else {
      parameters.push({
        in: target,
        name: target,//(schema as any).$ref as string, // ép kiểu $ref về string
        schema: schema as OpenAPIV3.SchemaObject,
      });
    }
  } else {
    if ('$id' in schema) {
      const id = (schema.$id as string).split('/').at(-1);

      if (target === 'json') {
        docs.requestBody = {
          content: {
            'application/json': {
              schema: {
                $ref: `#/components/schemas/V3${id?.replace('Dto', 'Request')}`,
              },
            }
          }
        }
      } else {
        if ("properties" in schema) {
          const keys = Object.keys(schema.properties);
          keys.map(key => {
            parameters.push({
              in: target,
              name: key,
              ...(schema.properties[key] as Object)
            });
          })
        }
      }

      docs.responses = {
        "200": {
          schema: {
            $ref: `#/components/schemas/V3${id?.replace('Dto', '')}Response`,
          }
        },
      } as unknown as OpenAPIV3.ResponsesObject;
    }
  }

  docs.parameters = parameters;
  delete docs.properties;

  if ('$id' in docs) {
    delete docs.$id;
  }

  return { docs, components: {} };
}

export * from './decorator';
export * from './formats';
export * from './keywords';
export * from './swagger/swagger';
export * from './swagger/interface';
