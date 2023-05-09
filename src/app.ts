/* eslint-disable @typescript-eslint/no-floating-promises */
import fastify from 'fastify';
import { usersRoutes } from './routes/users';
import { mealsRoutes } from './routes/meals';

const app = fastify();

app.get('/', async (request, reply) => {
  return { hello: 'world' };
});
app.register(usersRoutes, {
  prefix: 'users',
});
app.register(mealsRoutes, {
  prefix: 'meals',
});

export { app };
