import type { SessionStore } from '../../domain/ports/out/SessionStore';
import type { Session } from '../../domain/model/Session';
import { USER_ROLES } from '../../domain/constants/user';
export const SESSION_KEY = 'nexo.session';
export class BrowserSessionStore implements SessionStore {
  constructor(private readonly storage: Storage) {}
  get(): Session | null {
    try {
      const raw = this.storage.getItem(SESSION_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Session;
      if (typeof s.token !== 'string' || !s.token || !Number.isFinite(s.expiresAt) || typeof s.userId !== 'string' || !USER_ROLES.includes(s.role)) { this.clear(); return null; }
      return s;
    } catch { this.clear(); return null; }
  }
  save(session: Session) { this.storage.setItem(SESSION_KEY, JSON.stringify(session)); }
  clear() { this.storage.removeItem(SESSION_KEY); }
}
