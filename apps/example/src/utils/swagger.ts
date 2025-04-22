import { buildSchemasSwagger } from "@packages/ajv-decorator";
import * as TestAjvDtoReponses from "../response";
import * as TestAjvDtos from "../dtos";
import * as enums_test from "../enums";
import type { OpenAPIV3_1 } from 'openapi-types';
import type { DocsSwagger } from '@packages/ajv-decorator';

type ReferenceObject = OpenAPIV3_1.ReferenceObject;

export function generateSwaggerDocs() {
    const enums: Record<string, ReferenceObject> = buildSchemasSwagger(enums_test);
    const TestAjvDtoResponseSchema: Record<string, ReferenceObject> = buildSchemasSwagger(TestAjvDtoReponses);
    const TestAjvDtoSchema: Record<string, ReferenceObject> = buildSchemasSwagger(TestAjvDtos);

    const docs: DocsSwagger = {
        info: {
            title: 'example',
            version: '1.0.0',
            description: 'Example testing ajv decorator swagger'
        },
        schemas: {
            ...enums,
            ...TestAjvDtoSchema,
            ...TestAjvDtoResponseSchema
        }
    }
    return docs;
}
