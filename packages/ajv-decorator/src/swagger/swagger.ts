import { swaggerUI } from '@hono/swagger-ui';
import { Hono } from 'hono';
import { openAPISpecs } from 'hono-openapi';
import type { OpenAPIV3_1 } from 'openapi-types';
import { getAjvDocsSchema } from '../decorator';
import type { DocsSwagger } from './interface';
type ReferenceObject = OpenAPIV3_1.ReferenceObject;


export const buildSchemasSwagger = (schemas: Record<string, any>): Record<string, ReferenceObject> => {
    return Object.keys(schemas).reduce((acc, key) => {
        acc[key] = getAjvDocsSchema(schemas[key], key);
        return acc;
    }, {} as Record<string, ReferenceObject>);
}

export const setupSwagger = (app: Hono, docs: DocsSwagger) => {
    app.get(
        '/openapi',
        openAPISpecs(app, {
            documentation: {
                info: docs.info,
                components: {
                    schemas: docs.schemas,
                },
            },
        }),
    );

    app.get('/ui', swaggerUI({ url: '/openapi' }));
};
