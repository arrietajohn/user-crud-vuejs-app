import type { InjectionKey } from 'vue';
import { inject } from 'vue';
import type { UseCases } from '../../application/ports/in/use-cases';
export const USE_CASES: InjectionKey<UseCases> = Symbol('use-cases');
export function useApplication() {
  const app = inject(USE_CASES);
  if (!app) throw new Error('Falta configurar los casos de uso.');
  return app;
}
export const errorMessage = (e: unknown) => e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
export const roleLabel: Record<string, string> = { ADMIN: 'Administrador', MEMBER: 'Miembro', REVIEWER: 'Revisor' };
export const statusLabel: Record<string, string> = { ACTIVE: 'Activo', INACTIVE: 'Inactivo', PENDING: 'Pendiente', BLOCKED: 'Bloqueado' };
