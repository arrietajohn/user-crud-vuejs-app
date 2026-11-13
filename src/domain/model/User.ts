import type { UserRole, UserStatus } from '../constants/user';
import { USER_ROLES, USER_STATUSES } from '../constants/user';
import { DomainError } from '../exceptions/errors';
import { UserEmail, UserId, UserName } from '../valueobjects/user-values';

export class User {
  readonly id: UserId;
  readonly name: UserName;
  readonly email: UserEmail;
  constructor(id: string, name: string, email: string, public readonly role: UserRole, public readonly status: UserStatus) {
    this.id = new UserId(id); this.name = new UserName(name); this.email = new UserEmail(email);
    if (!USER_ROLES.includes(role)) throw new DomainError('El rol seleccionado no es válido.');
    if (!USER_STATUSES.includes(status)) throw new DomainError('El estado seleccionado no es válido.');
  }
}
