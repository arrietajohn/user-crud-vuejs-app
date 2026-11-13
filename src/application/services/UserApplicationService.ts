import type { UseCases } from '../ports/in/use-cases';
import type { UserGateway } from '../../domain/ports/out/UserGateway';
import type { SessionStore } from '../../domain/ports/out/SessionStore';
import type { LoginCommand, CreateUserCommand, UpdateUserCommand, DeleteUserCommand } from '../dto/commands/user-commands';
import type { GetUserQuery, ListUsersQuery } from '../dto/queries/user-queries';
import { User } from '../../domain/model/User';
import { UserEmail, UserId, UserPassword } from '../../domain/valueobjects/user-values';
import { DomainError } from '../../domain/exceptions/errors';
import { toUserResponse } from '../mapper/UserMapper';

export class UserApplicationService implements UseCases {
  constructor(private readonly gateway: UserGateway, private readonly sessions: SessionStore) {}
  async login(command: LoginCommand) {
    const email = new UserEmail(command.email).value;
    if (!command.password.trim()) throw new DomainError('Ingresa tu contraseña.');
    const session = await this.gateway.login(email, command.password);
    this.sessions.save(session);
    return { userId: session.userId, role: session.role, expiresAt: session.expiresAt };
  }
  currentSession() {
    const session = this.sessions.get();
    if (!session) return null;
    return { userId: session.userId, role: session.role, expiresAt: session.expiresAt };
  }
  logout() { this.sessions.clear(); }
  async create(c: CreateUserCommand) {
    const user = new User(c.id, c.name, c.email, c.role, 'PENDING');
    return toUserResponse(await this.gateway.create(user, new UserPassword(c.password).value));
  }
  async list(query: ListUsersQuery = {}) {
    const users = (await this.gateway.list()).map(toUserResponse);
    const search = query.search?.trim().toLowerCase();
    return search ? users.filter(u => `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(search)) : users;
  }
  async get(q: GetUserQuery) { return toUserResponse(await this.gateway.get(new UserId(q.id).value)); }
  async update(c: UpdateUserCommand) {
    const user = new User(c.id, c.name, c.email, c.role, c.status);
    return toUserResponse(await this.gateway.update(user, c.password ? new UserPassword(c.password).value : undefined));
  }
  delete(c: DeleteUserCommand) { return this.gateway.delete(new UserId(c.id).value); }
}
