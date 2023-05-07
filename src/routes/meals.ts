/* eslint-disable @typescript-eslint/return-await */
import { type FastifyInstance } from 'fastify';
import { z } from 'zod';
import { knex } from '../database';
import { type Meal } from 'knex/types/tables';
import { randomUUID } from 'node:crypto';
import { ensureAuthenticated } from '../middlewares/ensure-authenticated';

export async function mealsRoutes(app: FastifyInstance): Promise<void> {
  app.addHook('preHandler', ensureAuthenticated);

  app.post('/', async (request, reply) => {
    const getMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      datetime: z.coerce.date(),
      diet: z.boolean(),
    });

    const result = await getMealBodySchema.safeParseAsync(request.body);

    if (!result.success) {
      const data = {
        issues: result.error.issues,
        message: 'Validation issues!',
      };

      return reply.status(400).send(data);
    }

    const { name, datetime, description, diet } = result.data;

    const meal: Meal = {
      id: randomUUID(),
      userId: request.user.id,
      datetime: datetime.toISOString(),
      description,
      diet,
      name,
    };

    await knex('meals').insert(meal);

    return reply.status(201).send({
      message: 'Meal created!',
    });
  });
}