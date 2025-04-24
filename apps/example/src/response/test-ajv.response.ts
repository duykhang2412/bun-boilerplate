import { AjvField, AjvSchemaObject } from '@packages/ajv-decorator';

@AjvSchemaObject({
    required: [
        'ok',
    ],
})
export class TestAjvResponse {
    @AjvField({
        type: 'boolean',
    })
    ok!: boolean;
}
