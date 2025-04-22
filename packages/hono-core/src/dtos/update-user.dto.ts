import { AjvSchemaObject, AjvField } from '@packages/ajv-decorator';

@AjvSchemaObject({
    required: ['userId']
})
export class UpdateUserDto {
    @AjvField({
        type: 'string',
        minLength: 1,
        errorMessage: { format: 'userId must be a non‑empty string' }
    })
    userId!: string;

    @AjvField({
        type: 'string',
        minLength: 1,
        errorMessage: { format: 'userName must be a non‑empty string' }
    })
    userName?: string;
}
