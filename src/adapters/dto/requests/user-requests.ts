import type { UserRole, UserStatus } from '../../../domain/constants/user';
export interface LoginRequest { email: string; password: string }
export interface CreateUserRequest { id: string; name: string; email: string; password: string; role: UserRole }
export interface UpdateUserRequest { name: string; email: string; password?: string; role: UserRole; status: UserStatus }
