# Nexo · Administración de usuarios

Aplicación Vue 3 + TypeScript que consume [user-service](https://github.com/arrietajohn/user-service) con arquitectura hexagonal. Incluye inicio de sesión, registro público, bienvenida, creación, listado con filtros y paginación, edición, eliminación con confirmación y cierre de sesión. La interfaz está en español y se adapta a móvil y escritorio.


## Ejecutar

Requisitos: Node.js 22.12 o posterior y el backend ejecutándose (por defecto, `http://localhost:8080`).

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`. No se necesitan credenciales dentro del código: inicia sesión con un usuario **ACTIVE** de tu backend.

Para cambiar el servidor, crea un archivo `.env` usando [.env.example](./.env.example):

```dotenv
VITE_API_BASE_URL=/api
API_PROXY_TARGET=http://localhost:8080
```

`API_PROXY_TARGET` es el origen del backend, sin `/api`. El proxy de Vite conserva `/api` y evita restricciones CORS durante el desarrollo. Reinicia Vite al cambiar las variables. No agregues secretos: las variables `VITE_*` son públicas.

El repositorio es código fuente y no garantiza una URL pública desplegada. La aplicación apunta por defecto al backend local; puedes usar cualquier despliegue compatible cambiando el destino del proxy.

## Arquitectura

```text
src/
├── domain/
│   ├── constants/           Roles y estados
│   ├── exceptions/          Errores de dominio, API y autenticación
│   ├── valueobjects/        UserId, UserName, UserEmail, UserPassword
│   ├── model/               User y Session
│   └── ports/out/           UserGateway y SessionStore
├── application/
│   ├── dto/commands/        Login, Create, Update y Delete
│   ├── dto/queries/         GetUser y ListUsers
│   ├── dto/responses/       Datos de salida sin tokens ni contraseñas
│   ├── mapper/              Dominio → respuesta de aplicación
│   ├── ports/in/            Interfaces de los casos de uso
│   └── services/            Orquestación y validación de dominio
├── adapters/
│   ├── dto/requests/        Contrato HTTP de peticiones
│   ├── dto/responses/       Contrato HTTP de respuestas
│   ├── mapper/              DTO HTTP ↔ dominio
│   ├── http/                UserHttpAdapter implementa UserGateway
│   └── storage/             BrowserSessionStore implementa SessionStore
├── entrypoint/gui/          Vistas Vue, navegación y mensajes
└── bootstrap/               Composición e inyección de dependencias
```

El dominio y la aplicación no importan Vue ni conocen `fetch` o `localStorage`. La GUI recibe los puertos de entrada mediante `provide/inject` e invoca los casos de uso. La composición conecta los servicios con los adaptadores.

## Contrato de la API

Implementado según [el código del backend, revisión 33935e0](https://github.com/arrietajohn/user-service/tree/33935e0ad31e1fd94822bb91c74da793a5231765).

| Método | Endpoint | Acceso | Datos |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Público | `email`, `password`; devuelve `accessToken`, `tokenType`, `expiresIn` |
| POST | `/api/users` | Público | `id`, `name`, `email`, `password`, `role` |
| GET | `/api/users` | ADMIN, REVIEWER | Lista de usuarios |
| GET | `/api/users/{id}` | ADMIN, REVIEWER | Usuario individual |
| PUT | `/api/users/{id}` | ADMIN | `name`, `email`, `role`, `status`, `password` opcional |
| DELETE | `/api/users/{id}` | ADMIN | Sin cuerpo; responde 204 |

Los DTO de usuario contienen `id`, `name`, `email`, `role`, `status`. Roles: `ADMIN`, `MEMBER`, `REVIEWER`. Estados: `ACTIVE`, `INACTIVE`, `PENDING`, `BLOCKED`.

**Activación:** el backend crea usuarios en `PENDING`; su inicio de sesión requiere `ACTIVE`. Un administrador existente debe activarlos mediante edición. El registro público de la interfaz crea miembros; el panel permite seleccionar el rol. La primera cuenta activa debe aprovisionarse en el backend, que no ofrece activación pública.

La creación genera un UUID y lo conserva en los reintentos de un mismo formulario. El backend permite repetir la misma petición con el mismo ID y datos (200), y devuelve 409 si hay conflicto. Una contraseña vacía en edición se omite del PUT para conservar la anterior.

## Sesión y errores

- El token se conserva en `localStorage` bajo `nexo.session` y se reutiliza con `Authorization: Bearer …` en peticiones protegidas.
- El login y el registro público no envían tokens anteriores.
- Ante un **401** de una petición protegida se elimina la sesión y se redirige a `/login?expired=1`. Un 401 tardío no elimina una sesión más reciente.
- Un **403** muestra un mensaje de permisos y conserva la sesión. Los claims del JWT sirven para presentar la interfaz; el backend es la autoridad de autorización.
- Al cerrar sesión se elimina el token. El cierre se propaga entre pestañas mediante el evento `storage`.
- Los errores de validación, conflicto, servidor, conexión y tiempo de espera se muestran en la interfaz. Las peticiones tienen un límite de 30 segundos.

## Verificación

```bash
npm test
npm run build
```

Para pruebas completas en navegador necesitas [Postman CLI](https://learning.postman.com/docs/postman-cli/postman-cli-installation/) 1.70 o posterior y Chromium:

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright inicia automáticamente una simulación Postman en el puerto 4010 y Vite en el 5173; ambos puertos deben estar libres. El registro HTTP de la simulación se guarda localmente en `postman/simulation.log` (ignorado por Git). Los mocks son locales y se derivan del contrato del backend; no se hacen cambios en usuarios reales. Las credenciales `admin@example.com / password123` funcionan exclusivamente en la simulación. Esta no verifica firmas criptográficas de JWT y no reemplaza al backend.

Las pruebas cubren validación, mapeo, omisión de contraseñas vacías, almacenamiento, Bearer, 401, 403, carreras de sesión, CRUD desde el navegador, registro pendiente, navegación protegida y tamaño móvil. La evidencia de compatibilidad procede del código fuente y de los tests contra la simulación, no de una ejecución autenticada contra un despliegue real.

## Producción

```bash
npm run build
npm run preview
```

La compilación se genera en `dist/`. En producción configura tu servidor web para servir `index.html` en rutas de Vue Router y reenviar `/api` al backend. El proxy de desarrollo de Vite no forma parte de los archivos compilados ni de `preview`. Alternativamente compila con `VITE_API_BASE_URL=https://tu-backend/api`, con CORS configurado en el backend. Usa HTTPS para el despliegue.
