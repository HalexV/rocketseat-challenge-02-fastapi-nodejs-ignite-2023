/* eslint-disable @typescript-eslint/no-floating-promises */
import fastify from 'fastify';
import { usersRoutes } from './routes/users';

const app = fastify({
  logger: true,
});

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});
app.register(usersRoutes, {
  prefix: 'users',
});

export { app };
