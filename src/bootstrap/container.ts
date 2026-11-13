import { BrowserSessionStore } from '../adapters/storage/BrowserSessionStore';
import { HttpClient } from '../adapters/http/HttpClient';
import { UserHttpAdapter } from '../adapters/http/UserHttpAdapter';
import { UserApplicationService } from '../application/services/UserApplicationService';
const store = new BrowserSessionStore(localStorage);
export const useCases = new UserApplicationService(new UserHttpAdapter(new HttpClient(import.meta.env.VITE_API_BASE_URL || '/api', store, () => window.dispatchEvent(new Event('session-expired')))), store);
