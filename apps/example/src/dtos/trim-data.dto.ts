import { AjvAddKeyword, AjvField, AjvSchemaObject, isTrimData } from "@packages/ajv-decorator";

@AjvSchemaObject({
    required: ['content']
})
export class TestTrimDto {
    @AjvAddKeyword(isTrimData)
    @AjvField({
        type: 'string',
        minLength: 1,
        isTrimData: true,
        errorMessage: {
            isTrimData: 'invalid value from min to max length'
        }
    })
    content!: string
}


