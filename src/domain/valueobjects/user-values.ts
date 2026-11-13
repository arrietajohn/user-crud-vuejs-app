import { DomainError } from '../exceptions/errors';

export class UserId {
  readonly value: string;
  constructor(value: string) {
    this.value = value.trim();
    if (!this.value) throw new DomainError('El identificador es obligatorio.');
  }
}
export class UserName {
  readonly value: string;
  constructor(value: string) {
    this.value = value.trim();
    if (this.value.length < 3) throw new DomainError('El nombre debe tener al menos 3 caracteres.');
  }
}
export class UserEmail {
  readonly value: string;
  constructor(value: string) {
    this.value = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.value)) throw new DomainError('Ingresa un correo electrónico válido.');
  }
}
export class UserPassword {
  readonly value: string;
  constructor(value: string) {
    this.value = value.trim();
    if (this.value.length < 8) throw new DomainError('La contraseña debe tener al menos 8 caracteres.');
  }
}
