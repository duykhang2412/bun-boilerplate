import { AjvField, AjvSchemaObject } from '@packages/ajv-decorator';

import { ErrorResponse } from './error.response';

@AjvSchemaObject({
    required: [
        'ok', 'data', 'error'
    ],
})
export class UserResponse {
    @AjvField({
        type: 'boolean',
        nullable: true,
    })
    ok?: boolean;

    @AjvField({
        type: 'string'
    })
    data?: string;

    @AjvField({
        $ref: 'ErrorResponse',
    })
    error?: ErrorResponse | null;


}
