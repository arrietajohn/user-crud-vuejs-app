import type { SessionStore } from '../../domain/ports/out/SessionStore';
import { ApiError, UnauthorizedError } from '../../domain/exceptions/errors';
export class HttpClient {
  constructor(private readonly baseUrl: string, private readonly sessions: SessionStore, private readonly onUnauthorized: () => void) {}
  async request<T>(path: string, method = 'GET', body?: unknown, authenticated = true): Promise<T> {
    const session = authenticated ? this.sessions.get() : null;
    const token = session?.token;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}${path}`, {
        method, signal: controller.signal,
        headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
      // Only invalidate the session that made this request; a late 401 must not erase a new login.
      if (response.status === 401 && authenticated) {
        if (this.sessions.get()?.token === token) { this.sessions.clear(); this.onUnauthorized(); }
        throw new UnauthorizedError();
      }
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        const defaults: Record<number, string> = { 400: 'Revisa los datos ingresados.', 401: 'Correo o contraseña incorrectos, o cuenta pendiente de activación.', 403: 'No tienes permisos para realizar esta acción.', 404: 'No se encontró el usuario.', 409: 'Ya existe un usuario con ese identificador o correo.' };
        throw new ApiError(defaults[response.status] || (response.status >= 500 ? 'El servicio no está disponible. Intenta nuevamente.' : error?.message || 'No se pudo completar la solicitud.'), response.status);
      }
      if (response.status === 204) return undefined as T;
      return await response.json() as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (controller.signal.aborted) throw new ApiError('El servicio tardó demasiado en responder. Intenta nuevamente.', 0);
      throw new ApiError('No se pudo conectar con la API. Verifica la conexión y la configuración del servidor.', 0);
    } finally { clearTimeout(timeout); }
  }
}
