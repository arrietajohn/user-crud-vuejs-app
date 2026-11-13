import type { UserRole, UserStatus } from '../../../domain/constants/user';
export interface LoginCommand { email: string; password: string }
export interface CreateUserCommand { id: string; name: string; email: string; password: string; role: UserRole }
export interface UpdateUserCommand extends Omit<CreateUserCommand, 'password'> { password?: string; status: UserStatus }
export interface DeleteUserCommand { id: string }
