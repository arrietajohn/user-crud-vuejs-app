const http = require('http');
const seed = () => [{ id: 'admin-1', name: 'Administrador Nexo', email: 'admin@example.com', role: 'ADMIN', status: 'ACTIVE', password: 'password123' }, { id: 'reviewer-1', name: 'María González', email: 'maria@example.com', role: 'REVIEWER', status: 'ACTIVE', password: 'password123' }];
const publicUser = ({ password, ...user }) => user;
http.createServer(async (req, res) => {
  const state = typeof pm !== 'undefined' ? pm.state : null;
  const get = (key) => state ? state.get(`user-service.${key}`) : globalThis[`user-service.${key}`];
  const set = (key, value) => state ? state.set(`user-service.${key}`, value) : globalThis[`user-service.${key}`] = value;
  let users = await get('users'); if (!users) { users = seed(); await set('users', users); }
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname.replace(/^\/user-service/, '');
  const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(status === 204 ? undefined : JSON.stringify(body)); };
  let body = req.body;
  if (!body) { let raw = ''; for await (const chunk of req) raw += chunk; try { body = raw ? JSON.parse(raw) : {}; } catch { return send(400, { message: 'Invalid JSON' }); } }
  if (Buffer.isBuffer(body) || typeof body === 'string') { try { body = JSON.parse(body.toString()); } catch { return send(400, { message: 'Invalid JSON' }); } }
  if (path === '/__ready') return send(200, { ready: true });
  if (path === '/__reset') { await set('users', seed()); await set('failure', 0); return send(200, {}); }
  if (path === '/__failure') { await set('failure', body.status); return send(200, {}); }
  if (path === '/api/auth/login' && req.method === 'POST') {
    const user = users.find(u => u.email === body.email && u.password === body.password && u.status === 'ACTIVE');
    if (!user) return send(401, { status: 401, message: 'Invalid credentials or inactive user' });
    const token = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: user.id, role: user.role, exp: Math.floor(Date.now()/1000)+3600 })).toString('base64url'), 'local-simulation-signature'].join('.');
    return send(200, { accessToken: token, tokenType: 'Bearer', expiresIn: 3600 });
  }
  if (path === '/api/users' && req.method === 'POST') {
    if (!body.id || !body.name || body.name.trim().length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email || '') || !body.password || body.password.trim().length < 8 || !['ADMIN', 'MEMBER', 'REVIEWER'].includes(body.role)) return send(400, { status: 400, message: 'Invalid data' });
    const existing = users.find(u => u.id === body.id || u.email === body.email);
    if (existing) { const same = ['id', 'name', 'email', 'password', 'role'].every(k => existing[k] === body[k]); return send(same ? 200 : 409, same ? publicUser(existing) : { status: 409, message: 'User exists' }); }
    const user = { ...body, status: 'PENDING' }; users.push(user); await set('users', users); return send(201, publicUser(user));
  }
  if (path.startsWith('/api/users')) {
    const failure = await get('failure');
    if (failure) return send(failure, { status: failure, message: 'Injected authentication/authorization failure' });
    let claims; try { claims = JSON.parse(Buffer.from((req.headers.authorization || '').split(' ')[1].split('.')[1], 'base64url').toString()); } catch { return send(401, { status: 401, message: 'Unauthorized' }); }
    if (claims.exp <= Date.now()/1000) return send(401, { status: 401, message: 'Expired' });
    if (req.method === 'GET' && !['ADMIN', 'REVIEWER'].includes(claims.role) || ['PUT', 'DELETE'].includes(req.method) && claims.role !== 'ADMIN') return send(403, { status: 403, message: 'Forbidden' });
    if (path === '/api/users' && req.method === 'GET') return send(200, users.map(publicUser));
    const id = decodeURIComponent(path.slice('/api/users/'.length)); const user = users.find(u => u.id === id); if (!user) return send(404, { status: 404, message: 'Not found' });
    if (req.method === 'GET') return send(200, publicUser(user));
    if (req.method === 'DELETE') { await set('users', users.filter(u => u.id !== id)); return send(204); }
    if (req.method === 'PUT') {
      if (!body.name || body.name.trim().length < 3 || !body.email || !['ADMIN', 'MEMBER', 'REVIEWER'].includes(body.role) || !['ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED'].includes(body.status)) return send(400, { message: 'Invalid data' });
      if (users.some(u => u.id !== id && u.email === body.email)) return send(409, { message: 'User exists' });
      Object.assign(user, body, { password: body.password || user.password }); await set('users', users); return send(200, publicUser(user));
    }
  }
  send(501, { message: 'Endpoint outside the modeled contract' });
}).listen(process.env.PORT || 4010);
