import { describe, it, expect, vi } from 'vitest';
import { UserApplicationService } from '../../src/application/services/UserApplicationService';
import { UserHttpAdapter } from '../../src/adapters/http/UserHttpAdapter';
import { HttpClient } from '../../src/adapters/http/HttpClient';
import { BrowserSessionStore, SESSION_KEY } from '../../src/adapters/storage/BrowserSessionStore';
import { User } from '../../src/domain/model/User';
import type { UserGateway } from '../../src/domain/ports/out/UserGateway';
function memory() {
  const values = new Map<string, string>();
  return { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); }, clear: () => values.clear(), key: () => null, get length() { return values.size; } } as Storage;
}
describe('casos de uso', () => {
  it('normaliza datos y no llama al puerto cuando la contraseña es inválida', async () => {
    const create = vi.fn(async (u: User) => u);
    const app = new UserApplicationService({ create } as unknown as UserGateway, new BrowserSessionStore(memory()));
    await expect(app.create({ id: 'u1', name: '  Ana Pérez ', email: ' ANA@EXAMPLE.COM ', password: 'corta', role: 'MEMBER' })).rejects.toThrow('8 caracteres');
    expect(create).not.toHaveBeenCalled();
    expect(await app.create({ id: 'u1', name: '  Ana Pérez ', email: ' ANA@EXAMPLE.COM ', password: 'secreto123', role: 'MEMBER' })).toEqual({ id: 'u1', name: 'Ana Pérez', email: 'ana@example.com', role: 'MEMBER', status: 'PENDING' });
  });
  it('rechaza roles y estados ajenos al dominio', () => {
    expect(() => new User('a', 'Ana', 'ana@example.com', 'ROOT' as never, 'ACTIVE')).toThrow('rol');
    expect(() => new User('a', 'Ana', 'ana@example.com', 'ADMIN', 'BAD' as never)).toThrow('estado');
  });
  it('elimina datos corruptos de almacenamiento', () => {
    const storage = memory(); storage.setItem(SESSION_KEY, '{bad');
    expect(new BrowserSessionStore(storage).get()).toBeNull(); expect(storage.getItem(SESSION_KEY)).toBeNull();
  });
});
describe('transporte y sesión', () => {
  const session = { token: 'old-token', userId: 'u1', role: 'ADMIN' as const, expiresAt: Date.now() + 60000 };
  it('reutiliza Bearer y borra la sesión cuando el servidor devuelve 401', async () => {
    const store = new BrowserSessionStore(memory()); store.save(session); const expired = vi.fn();
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }));
    await expect(new HttpClient('/api', store, expired).request('/users')).rejects.toMatchObject({ status: 401 });
    expect(fetcher.mock.calls[0]![1]!.headers).toMatchObject({ Authorization: 'Bearer old-token' });
    expect(store.get()).toBeNull(); expect(expired).toHaveBeenCalledOnce(); fetcher.mockRestore();
  });
  it('un 403 conserva la sesión y muestra un error de permisos', async () => {
    const store = new BrowserSessionStore(memory()); store.save(session); const expired = vi.fn();
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 403 }));
    await expect(new HttpClient('/api', store, expired).request('/users')).rejects.toThrow('permisos');
    expect(store.get()?.token).toBe(session.token); expect(expired).not.toHaveBeenCalled(); fetcher.mockRestore();
  });
  it('un 401 tardío no borra una sesión recién iniciada', async () => {
    const store = new BrowserSessionStore(memory()); store.save(session); const expired = vi.fn();
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => { store.save({ ...session, token: 'new-token' }); return new Response('{}', { status: 401 }); });
    await expect(new HttpClient('/api', store, expired).request('/users')).rejects.toThrow();
    expect(store.get()?.token).toBe('new-token'); expect(expired).not.toHaveBeenCalled(); fetcher.mockRestore();
  });
  it('no envía un token viejo al login ni elimina la sesión por credenciales inválidas', async () => {
    const store = new BrowserSessionStore(memory()); store.save(session); const expired = vi.fn();
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 401 }));
    await expect(new UserHttpAdapter(new HttpClient('/api', store, expired)).login('ana@example.com', 'wrong')).rejects.toThrow('Correo o contraseña');
    expect(fetcher.mock.calls[0]![1]!.headers).not.toHaveProperty('Authorization'); expect(expired).not.toHaveBeenCalled(); fetcher.mockRestore();
  });
  it('el PUT omite una contraseña vacía y DELETE acepta un cuerpo vacío', async () => {
    const store = new BrowserSessionStore(memory()); store.save(session);
    const user = { id: 'u/1', name: 'Ana', email: 'ana@example.com', role: 'ADMIN' as const, status: 'ACTIVE' as const };
    const fetcher = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify(user))).mockResolvedValueOnce(new Response(null, { status: 204 }));
    const adapter = new UserHttpAdapter(new HttpClient('/api', store, vi.fn()));
    await adapter.update(new User(user.id, user.name, user.email, user.role, user.status)); await adapter.delete(user.id);
    expect(fetcher.mock.calls[0]![0]).toBe('/api/users/u%2F1'); expect(JSON.parse(fetcher.mock.calls[0]![1]!.body as string)).not.toHaveProperty('password'); fetcher.mockRestore();
  });
});
