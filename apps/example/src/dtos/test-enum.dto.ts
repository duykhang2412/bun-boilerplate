import { z } from "zod";
import { Role } from "../enums/role.enum";

export const RoleEnum = z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Role không hợp lệ' }),
});