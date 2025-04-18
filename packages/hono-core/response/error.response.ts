import { AjvField, AjvSchemaObject } from '@packages/ajv-decorator/test';

@AjvSchemaObject({
  required: ['code', 'message', 'details'],
})
export class ErrorResponse {
  @AjvField({
    type: 'number',
  })
  code!: number;

  @AjvField({
    type: 'string',
  })
  message!: string;

  @AjvField({
    type: 'array',
    items: {
      type: 'string',
    },
  })
  details!: string[];
}
