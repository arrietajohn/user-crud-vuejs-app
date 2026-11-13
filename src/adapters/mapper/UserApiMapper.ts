import { User } from '../../domain/model/User';
import type { ApiUserResponse } from '../dto/responses/user-responses';
import type { CreateUserRequest, UpdateUserRequest } from '../dto/requests/user-requests';
export const fromApiUser = (u: ApiUserResponse) => new User(u.id, u.name, u.email, u.role, u.status);
export const toCreateRequest = (u: User, password: string): CreateUserRequest => ({ id: u.id.value, name: u.name.value, email: u.email.value, password, role: u.role });
export const toUpdateRequest = (u: User, password?: string): UpdateUserRequest => ({ name: u.name.value, email: u.email.value, role: u.role, status: u.status, ...(password ? { password } : {}) });
