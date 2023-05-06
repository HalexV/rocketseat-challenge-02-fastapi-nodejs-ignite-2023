/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { type FastifyReply, type FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../env';
import { knex } from '../database';

interface IPayload {
  id: string;
}

export async function ensureAuthenticated(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { authorization } = request.headers;

  if (authorization == null) {
    return reply.status(400).send({
      message: 'Bearer jwt token required on authorization header!',
    });
  }

  const [bearer, token] = authorization.split(' ');

  if (bearer !== 'Bearer') {
    return reply.status(400).send({
      message: 'Bearer jwt token required on authorization header!',
    });
  }

  let payload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET) as IPayload;
  } catch (error) {
    return reply.status(401).send({
      message: 'Invalid token!',
    });
  }

  const user = await knex('users')
    .where({
      id: payload.id,
    })
    .first();

  if (user == null) {
    return reply.status(401).send({
      message: 'Invalid token!',
    });
  }

  request.user = {
    id: user.id,
  };
}
