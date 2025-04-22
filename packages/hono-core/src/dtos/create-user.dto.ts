import { AjvSchemaObject, AjvField } from '@packages/ajv-decorator';

@AjvSchemaObject({
    required: ['userId', 'userName']
})
export class CreateUserDto {
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
    userName!: string;
}
