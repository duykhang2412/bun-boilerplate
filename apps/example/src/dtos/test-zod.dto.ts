import { z } from "zod";
import { RoleEnum } from "./test-enum.dto";

export const UserDto = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, { message: 'Name không được để trống' }),
    email: z.string().email({ message: 'Email không hợp lệ' }),
    age: z.number().int().nonnegative({ message: 'Age phải là số nguyên >= 0' }),

    roles: z
        .array(RoleEnum)
        .min(1, { message: 'Phải có ít nhất một role' })
        .optional(),

    tags: z
        .array(z.string().min(1, { message: 'Tag không được để trống' }))
        .refine((arr) => new Set(arr).size === arr.length, {
            message: 'Tags phải duy nhất',
        })
        .optional(),
});

export type UserDto = z.infer<typeof UserDto>;
export const CreateUserDto = UserDto.omit({ id: true });
export type CreateUserDto = z.infer<typeof CreateUserDto>;
export const UpdateUserDto = UserDto.partial().omit({ id: true });
export type UpdateUserDto = z.infer<typeof UpdateUserDto>;