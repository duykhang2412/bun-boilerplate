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
    });

    (middleware as any)[uniqueSymbol] = {
        resolver: async () => generateAjvValidatorDocs(target, schema),
        metadata: { schemaType: 'input' },
    };

    return middleware;
}

export async function generateAjvValidatorDocs<
    Target extends keyof ValidationTargets,
>(target: Target, schema: object) {
    const docs: Partial<OpenAPIV3.OperationObject> = schema;

    docs.parameters = [];
    docs.requestBody = undefined;

    // Nếu target là "json" hoặc "form", sử dụng requestBody
    if (target === 'form' || target === 'json') {
        let id = (schema as any).$id;
        if (id && typeof id === 'string') {
            id = id?.split('/').at(-1);

            docs.requestBody = {
                content: {
                    [target === 'json' ? 'application/json' : 'multipart/form-data']: {
                        schema: { $ref: `#/components/schemas/${id}` },
                    },
                },
            };

            docs.responses = {
                200: {
                    $ref: `#/components/schemas/${id?.replace('Dto', '')}Response`,
                },
            } as OpenAPIV3.ResponsesObject;
        }
    } else {
        // Với các target như "query" hoặc "param", chuyển schema thành parameters.
        const parameters: (
            | OpenAPIV3.ReferenceObject
            | OpenAPIV3.ParameterObject
        )[] = [];

        // Nếu schema có $ref và $ref là string, dùng trực tiếp để tham chiếu.
        if ('$ref' in schema && typeof (schema as any).$ref === 'string') {
            parameters.push({
                in: target,
                name: (schema as any).$ref as string, // ép kiểu $ref về string
                schema: schema as OpenAPIV3.SchemaObject,
            });
        } else {
            if ('$id' in schema) {
                const id = (schema.$id as string).split('/').at(-1);

                parameters.push({
                    in: target,
                    name: (schema as any).$id as string, // ép kiểu $ref về string
                    schema: {
                        $ref: `#/components/schemas/${id}`,
                    },
                });

                docs.responses = {
                    200: {
                        $ref: `#/components/schemas/${id?.replace('Dto', '')}Response`,
                    },
                } as OpenAPIV3.ResponsesObject;
            }
        }

        docs.parameters = parameters;
    }

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
