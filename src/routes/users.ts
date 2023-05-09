/* eslint-disable @typescript-eslint/return-await */
import { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { type User } from 'knex/types/tables';
import { randomUUID } from 'node:crypto';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../env';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  app.post('/', async (request, reply) => {
    const getUserBodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
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

    return reply.status(201).send({
      message: 'User created!',
    });
  });

  app.post('/authenticate', async (request, reply) => {
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

    const user = await knex('users').where({ email }).first();

    if (user == null) {
      return reply.status(400).send({
        message: 'Email or password incorrect!',
      });
    }

    const match = await argon2.verify(user.password, password);

    if (!match) {
      return reply.status(400).send({
        message: 'Email or password incorrect!',
      });
    }

    const payload = {
      id: user.id,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return reply.send({
      message: 'User authenticated!',
      token,
    });
  });
}
