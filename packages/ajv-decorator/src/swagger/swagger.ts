import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { openAPISpecs } from 'hono-openapi';
import type { OpenAPIV3_1 } from 'openapi-types';
import { getAjvDocsSchema } from '../decorator';
import type { DocsSwagger } from './interface';
type ReferenceObject = OpenAPIV3_1.ReferenceObject;

function swapComponentsSchemas(schema: Record<string, any>): Record<string, unknown> {
  const keys = Object.keys(schema);

  keys.map(key => {
    const data = schema[key];

    if ('properties' in schema[key]) {
      const propertyKeys = Object.keys(schema[key].properties as Object);

      propertyKeys.map(propKey => {
        const dataProp = schema[key].properties[propKey];

        if ('$ref' in dataProp) {
          dataProp.$ref = `#/components/schemas/V3${dataProp.$ref}`;
        }
        if (dataProp.type === 'array' && 'items' in dataProp && '$ref' in dataProp.items) {
          dataProp.items.$ref = `#/components/schemas/V3${dataProp.items.$ref}`
        }
        if ('additionalProperties' in dataProp && '$ref' in dataProp.additionalProperties) {
          dataProp.additionalProperties.$ref = `#/components/schemas/V3${dataProp.additionalProperties.$ref}`;
        }
        if ('const' in dataProp) {
          delete dataProp.const;
        }
        schema[key].properties[propKey] = dataProp;
      })
    }

    delete schema[key];
    data.$id = key;

    schema[key] = data;
  })
  return schema;
}

function swapPathsSchemas(schema: Record<string, any>): Record<string, unknown> {
  const keys = Object.keys(schema);

  keys.map(key => {
    const data = schema[key];
    const methodKeys = Object.keys(data);
    methodKeys.map(method => {
      if ('parameters' in schema[key][method]) {
        schema[key][method].parameters.map((dataProp: any, index: any) => {
          if ('$ref' in dataProp) {
            dataProp.$ref = `#/components/schemas/V3${dataProp.$ref}`;
          }
          if (dataProp.type === 'array' && 'items' in dataProp && '$ref' in dataProp.items) {
            dataProp.items.$ref = `#/components/schemas/V3${dataProp.items.$ref}`
          }
          if ('additionalProperties' in dataProp && '$ref' in dataProp.additionalProperties) {
            dataProp.additionalProperties.$ref = `#/components/schemas/V3${dataProp.additionalProperties.$ref}`;
          }
          if ('const' in dataProp) {
            delete dataProp.const;
          } schema[key][method].parameters[index] = dataProp;
        })
      }
    })

  })

  return schema;
}

export const buildSchemasSwagger = (schemas: Record<string, any>): Record<string, ReferenceObject> => {
  return Object.keys(schemas).reduce((acc, key) => {
    acc[key] = getAjvDocsSchema(schemas[key], key);
    return acc;
  }, {} as Record<string, ReferenceObject>);
}

export const setupSwagger = (app: Hono, docs: DocsSwagger, prefix?: string) => {
  app.get(
    `docs`,
    openAPISpecs(app, {
      documentation: {
        info: docs.info,
        components: {
          schemas: warpSchemaToV3Proto(docs.schemas),
        },
      },
    }),
  );

  app.get(
    `${prefix ? `/${prefix}` : ''}/openapi`,
    async (c) => {
      const host = c.req.header('host') || 'localhost';
      const protocol = c.req.header('x-forwarded-proto') || 'http';
      const baseUrl = `${protocol}://${host}`;

      const url = new URL('/docs', baseUrl);
      const req = new Request(url.toString(), { method: 'GET' });

      const response = await app.fetch(req);
      const swaggerJson = await response.json() as {
        components: { schemas: Record<string, any> },
        paths: Record<string, any>
      };
      swaggerJson.components.schemas = swapComponentsSchemas(swaggerJson.components.schemas);
      swaggerJson.paths = swapPathsSchemas(swaggerJson.paths);
      return c.json(swaggerJson);
    }
  );

  app.get(`${prefix ? `/${prefix}` : ''}/ui`, swaggerUI({ url: `${prefix ? `/${prefix}` : ''}/openapi` }));
};

export function warpSchemaToV3Proto(schemas: Record<string, any>): any {
  const keys = Object.keys(schemas);
  const result: Record<string, any> = {};

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex++) {
    const key = keys[keyIndex];
    const schema = schemas[key as any];
    if (schema) {
      const $id = schema['$id'] ? `V3${schema['$id']}` : `V3${key}`;
      result[$id] = schema;
    }
  }

  return result;
}
