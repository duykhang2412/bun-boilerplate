import { tags, validate } from 'typia';

export class UserInterface {
    userId?: string & tags.MinLength<1>;
    userName?: string & tags.MinLength<1>;
}

export function validateUserDto(
    data: UserInterface,
) {
    const validateResult = validate<UserInterface>(data);
    return validateResult;
}