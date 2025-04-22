import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import { AjvAddFormat, AjvField, AjvSchemaObject, isDateTime, isEmoji } from '@packages/ajv-decorator';
import { PaginationDto } from './pagination.dto';
import { Status } from '../enums';

const ajv = new Ajv({ allErrors: true });
ajvErrors(ajv);

@AjvSchemaObject({
    required: [
        'checkArray',
        'checkArrayObject',
        'checkBoolean',
        'checkDateTime',
        'checkEnum',
        'checkNumber',
        'checkObject',
        'limit'
    ],
})
export class TestAjvDto extends PaginationDto{
    @AjvField({
        type: 'array',
        minItems: 1,
        items: {
            type: 'string'
        }
    })
    checkArray!: Array<string>;

    @AjvField({
        type: 'array',
        minItems: 1,
        items: {
            type: 'object',
            properties: {
                title: { type: 'string', minLength: 1 },
                body: { type: 'string', minLength: 1 },
            }
        },
        additionalProperties: false,
    })
    checkArrayObject!: {
        title: string;
        body: string;
    }[];

    @AjvField({
        type: 'boolean'
    })
    checkBoolean!: boolean;

    @AjvAddFormat('isDateTime', isDateTime)
    @AjvField({
        type: 'string',
        format: 'isDateTime',
        errorMessage: {
            format: 'invalid format datetime'
        }
    })
    checkDateTime!: string;

    @AjvField({
        $ref: 'Status'
    })
    checkEnum!: Status;

    @AjvField({
        type: 'integer'
    })
    checkNumber!: number;

    @AjvField({
        type: 'object',
        properties: {
            title: { type: 'string', minLength: 1 },
            body: { type: 'string', minLength: 1, nullable: true},
        }
    })
    checkObject!: {
        title: string;
        body?: string;
    };

    @AjvAddFormat('isEmoji', isEmoji)
    @AjvField({
        type: 'string',
        format: 'isEmoji',
        errorMessage: {
            format: 'invalid format emoji'
        }
    })
    checkEmoji!: string;
}
