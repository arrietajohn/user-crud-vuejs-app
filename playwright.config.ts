import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', headless: true, trace: 'retain-on-failure' },
  webServer: [
    { command: 'postman simulation run postman/simulations/users/users.sim.yaml --port 4010 --no-history --output ndjson > postman/simulation.log', url: 'http://127.0.0.1:4010/user-service/__ready', reuseExistingServer: false, timeout: 120000 },
    { command: 'npm run dev -- --port 5173 --strictPort', url: 'http://127.0.0.1:5173', env: { API_PROXY_TARGET: 'http://127.0.0.1:4010/user-service', VITE_API_BASE_URL: '/api' }, reuseExistingServer: false },
  ],
});
