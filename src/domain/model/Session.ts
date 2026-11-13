import type { UserRole } from '../constants/user';
export interface Session { token: string; expiresAt: number; userId: string; role: UserRole }
