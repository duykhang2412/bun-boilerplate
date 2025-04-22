import { AjvField, AjvSchemaObject } from '@packages/ajv-decorator';

@AjvSchemaObject({
    required: [
        'ok',
    ],
})
export class UserResponse {
    @AjvField({
        type: 'boolean',
    })
    ok!: boolean;
}
