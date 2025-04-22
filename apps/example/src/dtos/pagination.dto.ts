import {
  AjvAddKeyword,
  AjvField,
  AjvSchemaObject,
  isNumber,
} from '@packages/ajv-decorator';

@AjvSchemaObject({
  not: {
    required: ['nextPageToken', 'prevPageToken'],
  },
  errorMessage: {
    not: 'enter either prevPageToken or nextPageToken',
  },
  required: ['limit'],
})
export class PaginationDto {
  @AjvAddKeyword(isNumber)
  @AjvField({
    type: 'string',
    isNumber: {
      minimum: 1,
      maximum: 10,
      default: 1,
    },
    errorMessage: {
      isNumber: 'wrong type or invalid value input',
    },
  })
  limit!: number;

  @AjvField({
    type: 'string',
    minLength: 1,
    nullable: true,
  })
  nextPageToken?: string;

  @AjvField({
    type: 'string',
    minLength: 1,
    nullable: true,
  })
  prevPageToken?: string;
}
