export const USER_ROLES = ['ADMIN', 'MEMBER', 'REVIEWER'] as const;
export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED'] as const;
export type UserRole = typeof USER_ROLES[number];
export type UserStatus = typeof USER_STATUSES[number];
