import type { UserRole, UserStatus } from '../../../domain/constants/user';
export interface ApiUserResponse { id: string; name: string; email: string; role: UserRole; status: UserStatus }
export interface LoginResponse { accessToken: string; tokenType: string; expiresIn: number }
export interface ApiErrorResponse { status: number; message: string }
