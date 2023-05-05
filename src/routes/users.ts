/* eslint-disable @typescript-eslint/return-await */
import { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { type User } from 'knex/types/tables';
import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', async (request, reply) => {
    const getUserBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const result = await getUserBodySchema.safeParseAsync(request.body);

    if (!result.success) {
      const data = {
        issues: result.error.issues,
        message: 'Validation issues!',
      };

      return reply.status(400).send(data);
    }

    const { email, password } = result.data;

    const userFound = await knex('users').where({ email }).first();

    if (userFound != null) {
      return reply.status(400).send({
        message: 'User already exists!',
      });
    }

    const user: User = {
      id: randomUUID(),
      email,
      password: await argon2.hash(password),
    };

    await knex('users').insert(user);

    return reply.send({
      message: 'User created!',
    });
  });
}
