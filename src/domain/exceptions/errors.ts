export class DomainError extends Error {}
export class ApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); }
}
export class UnauthorizedError extends ApiError {
  constructor() { super('Tu sesión venció. Inicia sesión nuevamente.', 401); }
}
