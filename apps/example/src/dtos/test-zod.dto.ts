import { z } from "zod";

export const UserDto = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, { message: 'Invalid name' }),
    email: z.string().email({ message: 'Invalid Email' }),
    age: z.number().int().nonnegative({ message: 'Age must be negative number' }),
    tags: z
        .array(z.string().min(1, { message: 'Invalid Tag' }))
        .refine((arr) => new Set(arr).size === arr.length, {
            message: 'Tags must be unique',
        })
});

export type UserDto = z.infer<typeof UserDto>;
export const CreateUserDto = UserDto.omit({ id: true });
export type CreateUserDto = z.infer<typeof CreateUserDto>;
export const UpdateUserDto = UserDto.partial().omit({ id: true });
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;