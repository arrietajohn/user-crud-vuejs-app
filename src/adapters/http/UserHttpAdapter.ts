import type { UserGateway } from '../../domain/ports/out/UserGateway';
import type { User } from '../../domain/model/User';
import type { Session } from '../../domain/model/Session';
import { USER_ROLES } from '../../domain/constants/user';
import { ApiError } from '../../domain/exceptions/errors';
import type { ApiUserResponse, LoginResponse } from '../dto/responses/user-responses';
import { fromApiUser, toCreateRequest, toUpdateRequest } from '../mapper/UserApiMapper';
import { HttpClient } from './HttpClient';
export class UserHttpAdapter implements UserGateway {
  constructor(private readonly http: HttpClient) {}
  async login(email: string, password: string): Promise<Session> {
    const result = await this.http.request<LoginResponse>('/auth/login', 'POST', { email, password }, false);
    try {
      const part = result.accessToken.split('.')[1]!;
      const claims = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
      if (typeof claims.sub !== 'string' || !USER_ROLES.includes(claims.role) || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now() || result.tokenType !== 'Bearer') throw new Error();
      // Claims are used for display only. Authorization is always enforced by the API.
      return { token: result.accessToken, expiresAt: claims.exp * 1000, userId: claims.sub, role: claims.role };
    } catch { throw new ApiError('La API devolvió un token de sesión inválido.', 502); }
  }
  async list() { return (await this.http.request<ApiUserResponse[]>('/users')).map(fromApiUser); }
  async get(id: string) { return fromApiUser(await this.http.request<ApiUserResponse>(`/users/${encodeURIComponent(id)}`)); }
  async create(u: User, password: string) { return fromApiUser(await this.http.request<ApiUserResponse>('/users', 'POST', toCreateRequest(u, password), false)); }
  async update(u: User, password?: string) { return fromApiUser(await this.http.request<ApiUserResponse>(`/users/${encodeURIComponent(u.id.value)}`, 'PUT', toUpdateRequest(u, password))); }
  delete(id: string) { return this.http.request<void>(`/users/${encodeURIComponent(id)}`, 'DELETE'); }
}
