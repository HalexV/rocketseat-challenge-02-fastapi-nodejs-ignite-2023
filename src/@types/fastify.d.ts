// eslint-disable-next-line
import Fastify from 'fastify';

declare module 'fastify/types/request' {
  interface User {
    id: string;
  }

  interface FastifyRequest {
    user: User;
  }
}
