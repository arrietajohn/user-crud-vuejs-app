import type { User } from '../../domain/model/User';
import type { UserResponse } from '../dto/responses/user-responses';
export const toUserResponse = (user: User): UserResponse => ({ id: user.id.value, name: user.name.value, email: user.email.value, role: user.role, status: user.status });
