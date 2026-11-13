import type { User } from '../../model/User';
import type { Session } from '../../model/Session';
export interface UserGateway {
  login(email: string, password: string): Promise<Session>;
  list(): Promise<User[]>;
  get(id: string): Promise<User>;
  create(user: User, password: string): Promise<User>;
  update(user: User, password?: string): Promise<User>;
  delete(id: string): Promise<void>;
}
