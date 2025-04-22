import { AjvSchemaObject, AjvField } from '@packages/ajv-decorator';

@AjvSchemaObject({
    required: ['userId']
})
export class GetUserDto {
    @AjvField({
        type: 'string',
        minLength: 1
    })
    userId!: string;
}
