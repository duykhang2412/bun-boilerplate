import { z } from 'zod';

export const UserDto = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, { message: 'Name không được để trống' }),
    email: z.string().email({ message: 'Email không hợp lệ' }),
    age: z.number().int().nonnegative({ message: 'Age phải là số nguyên >= 0' }),
});

export type UserDto = z.infer<typeof UserDto>;

export const CreateUserDto = UserDto.omit({ id: true });
export type CreateUserDto = z.infer<typeof CreateUserDto>;

export const UpdateUserDto = UserDto.partial().omit({ id: true });
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;

