import type { UserRole, UserStatus } from '../../../domain/constants/user';
export interface UserResponse { id: string; name: string; email: string; role: UserRole; status: UserStatus }
export interface SessionResponse { userId: string; role: UserRole; expiresAt: number }
