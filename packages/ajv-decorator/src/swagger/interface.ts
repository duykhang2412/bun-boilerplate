import type { OpenAPIV3_1 } from 'openapi-types';
type ReferenceObject = OpenAPIV3_1.ReferenceObject;

export interface DocsSwagger {
    info: {
        title: string;
        version: string;
        description: string;
    };
    schemas: Record<string, ReferenceObject>;
}