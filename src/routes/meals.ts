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

  app.get('/', async (request, reply) => {
    const { id } = request.user;

    const meals = await knex('meals').where({ userId: id });

    meals.forEach((meal) => {
      meal.diet = Boolean(meal.diet);
    });

    return reply.send({
      meals,
    });
  });

  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.user;
    const mealId = request.params.id;

    const meal = await knex('meals').where({ userId: id, id: mealId }).first();

    if (meal == null) {
      return reply.status(404).send({
        message: 'Meal not found!',
      });
    }

    meal.diet = Boolean(meal.diet);

    return reply.send({
      meal,
    });
  });

  app.get('/statistics', async (request, reply) => {
    const { id } = request.user;

    const statistics = {
      meals_total: 0,
      meals_on_diet_total: 0,
      meals_off_diet_total: 0,
      best_sequence_meals_on_diet: 0,
    };

    const stream = knex('meals')
      .where({ userId: id })
      .orderBy('datetime', 'asc')
      .stream();

    request.socket.on('close', () => {
      stream.destroy();
    });

    let bestSequence = 0;

    for await (const meal of stream) {
      statistics.meals_total++;

      if (meal.diet) {
        statistics.meals_on_diet_total++;
        bestSequence++;
      } else {
        statistics.meals_off_diet_total++;
        if (bestSequence > statistics.best_sequence_meals_on_diet) {
          statistics.best_sequence_meals_on_diet = bestSequence;
        }
        bestSequence = 0;
      }
    }

    if (bestSequence > statistics.best_sequence_meals_on_diet) {
      statistics.best_sequence_meals_on_diet = bestSequence;
    }

    return reply.send({
      statistics,
    });
  });

  app.put<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.user;
    const mealId = request.params.id;

    const putMealBodySchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      datetime: z.coerce.date().optional(),
      diet: z.boolean().optional(),
    });

    const result = await putMealBodySchema.safeParseAsync(request.body);

    if (!result.success) {
      const data = {
        issues: result.error.issues,
        message: 'Validation issues!',
      };

      return reply.status(400).send(data);
    }

    if (Object.keys(result.data).length === 0) {
      return reply.status(400).send({
        message: 'No data to edit!',
      });
    }

    const { datetime, description, diet, name } = result.data;

    const meal = await knex('meals').where({ userId: id, id: mealId }).first();

    if (meal == null) {
      return reply.status(404).send({
        message: 'Meal not found!',
      });
    }

    const alteredMeal: Meal = {
      id: meal.id,
      userId: meal.userId,
      name: name ?? meal.name,
      datetime: datetime != null ? datetime.toISOString() : meal.datetime,
      description: description ?? meal.description,
      diet: diet ?? meal.diet,
    };

    await knex('meals').where({ userId: id, id: mealId }).update(alteredMeal);

    return reply.send({
      message: 'Meal updated!',
    });
  });

  app.delete<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const { id } = request.user;
    const mealId = request.params.id;

    const meal = await knex('meals').where({ userId: id, id: mealId }).first();

    if (meal == null) {
      return reply.status(404).send({
        message: 'Meal not found!',
      });
    }

    await knex('meals').where({ userId: id, id: mealId }).del();

    return reply.send({
      message: 'Meal deleted!',
    });
  });
}
