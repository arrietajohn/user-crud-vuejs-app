import type { Session } from '../../model/Session';
export interface SessionStore {
  get(): Session | null;
  save(session: Session): void;
  clear(): void;
}
