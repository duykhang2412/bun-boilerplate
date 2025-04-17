import 'reflect-metadata';

import Ajv, { ErrorObject } from 'ajv';
import addErrors from 'ajv-errors';

const AJV_SCHEMA_KEY = Symbol('ajv:schema');

export const ajv = new Ajv({
    strict: false,
    allErrors: true,
});

addErrors(ajv);

export function AjvAddKeyword(schema: any) {
    return function (target: any, propertyKey: string) {
        if (schema) {
            ajv.addKeyword(schema());
        }
    };
}

export function AjvAddFormat(name: string, schema: any) {
    return function (target: any, propertyKey: string) {
        if (schema) {
            ajv.addFormat(name, schema());
        }
    };
}

export function AjvSchemaObject(schema: object) {
    return function (target: any) {
        let existingSchema =
            Reflect.getMetadata(AJV_SCHEMA_KEY, target.prototype) || {};

        const parent = Object.getPrototypeOf(target);
        if (parent) {
            const parentSchema = Reflect.getMetadata('ajv:schema', parent) || {};
            existingSchema = { ...parentSchema, ...existingSchema };
        }

        Reflect.defineMetadata(
            AJV_SCHEMA_KEY,
            { ...existingSchema, ...schema, $id: target.name },
            target.prototype,
        );
    };
}

export function AjvField(schema: object) {
    return function (target: any, propertyKey: string) {
        const existingSchema = Reflect.getMetadata(AJV_SCHEMA_KEY, target) || {};
        existingSchema['properties'] = {
            ...existingSchema['properties'],
            [propertyKey]: schema,
        };
        Reflect.defineMetadata(AJV_SCHEMA_KEY, existingSchema, target);
    };
}

export function AjvFieldType(schema: any, key?: string) {
    return function (target: any, propertyKey: string) {
        try {
            const existingSchema =
                Reflect.getMetadata(AJV_SCHEMA_KEY, schema.prototype);

            if (key && existingSchema) {
                if (!ajv.getSchema(`${key}`)) {
                    ajv.addSchema(existingSchema, key);
                }
            }
        } catch (e) { }
    };
}

export function getAjvDocsSchema(target: any, key?: string) {
    const properties =
        Reflect.getMetadata(AJV_SCHEMA_KEY, target.prototype ?? target) || {};

    const schema = {
        $id: target.name,
        type: 'object',
        additionalProperties: false,
        ...properties,
    };

    if (typeof target === 'object') {
        const keys = Object.keys(target);
        if (keys.some(key => !isNaN(Number(key)))) {
            schema.type = 'number';
            schema.$id = key;
            const listData = Object.values(target);
            schema.enum = listData.filter(v => typeof v === 'number');
            schema['x-enum-varnames'] = listData.filter(v => typeof v === 'string');
        }

        if (key && schema) {
            if (!ajv.getSchema(`${key}`)) {
                ajv.addSchema(schema, key);
            }
        }
    }

    return schema;
}

export function getAjvSchema(target: any, key?: string) {
    const properties =
        Reflect.getMetadata(AJV_SCHEMA_KEY, target.prototype ?? target) || {};

    const parent = Object.getPrototypeOf(target);

    let mergedSchema = {};
    if (parent) {
        const parentSchema = Reflect.getMetadata("ajv:schema", parent);
        if (parentSchema) {
            mergedSchema = { ...parentSchema, ...properties };
        }
    }

    const schema = {
        $id: target.name,
        type: 'object',
        additionalProperties: false,
        ...properties,
        ...mergedSchema
    };

    return schema;
}

export function handleErrors(validateResult: ErrorObject[]): {
    ok: boolean;
    error: { code: number; message: string; details: string[] };
} {
    const minimalErrors = validateResult
        .filter((e) => e.keyword !== 'if')
        .map(({ instancePath, message }) => {
            const propertyName = instancePath ? instancePath.slice(1) : ''; //remove path
            const propertyMessage = message?.replace(/["\\]/g, ''); //remove spec char
            const char = `${propertyName} ${propertyMessage}`;
            return {
                message: propertyName === '' ? char.trim() : char,
            };
        });

    return {
        ok: false,
        error: {
            code: 1000,
            message: 'Invalid argument',
            details: minimalErrors.map((error) => error.message),
        },
    };
}
