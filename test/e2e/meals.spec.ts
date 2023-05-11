import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import request from 'supertest';

import { execSync } from 'node:child_process';
import { app } from '../../src/app';
import { knex } from '../../src/database';

async function getCredentials(): Promise<{
  userAToken: string;
  userBToken: string;
}> {
  await request(app.server).post('/users').send({
    email: 'testa@test.com',
    password: 'abc1234',
  });

  await request(app.server).post('/users').send({
    email: 'testb@test.com',
    password: 'abc1234',
  });

  const authenticatedUserA = await request(app.server)
    .post('/users/authenticate')
    .send({
      email: 'testa@test.com',
      password: 'abc1234',
    });

  const authenticatedUserB = await request(app.server)
    .post('/users/authenticate')
    .send({
      email: 'testb@test.com',
      password: 'abc1234',
    });

  return {
    userAToken: `Bearer ${authenticatedUserA.body.token as string}`,
    userBToken: `Bearer ${authenticatedUserB.body.token as string}`,
  };
}

const validInputMeals = [
  {
    name: 'Test meal A',
    description: 'A test meal A',
    diet: true,
    datetime: new Date('2023-05-01T13:00:00.000Z').toISOString(),
  },
  {
    name: 'Test meal B',
    description: 'A test meal B',
    diet: false,
    datetime: new Date('2023-05-01T15:00:00.000Z').toISOString(),
  },
  {
    name: 'Test meal C',
    description: 'A test meal C',
    diet: true,
    datetime: new Date('2023-05-02T13:00:00.000Z').toISOString(),
  },
  {
    name: 'Test meal D',
    description: 'A test meal D',
    diet: true,
    datetime: new Date('2023-05-03T13:00:00.000Z').toISOString(),
  },
];

describe('Meals routes', () => {
  let credentials: {
    userAToken: string;
    userBToken: string;
  };

  beforeAll(async () => {
    execSync('npm run knex migrate:latest');
    await app.ready();
    credentials = await getCredentials();
  });

  afterAll(async () => {
    execSync('npm run knex migrate:rollback --all');
    await app.close();
  });

  beforeEach(async () => {
    await knex('meals').del();
  });

  describe('POST:meals/', () => {
    it('should not be able to create a meal with invalid data', async () => {
      const mealCreateResponse = await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send({
          email: 'test@test.com',
          password: 'abc1234',
        });

      const expectedResponseBody = {
        issues: [
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['name'],
            message: 'Required',
          },
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['description'],
            message: 'Required',
          },
          {
            code: 'invalid_date',
            path: ['datetime'],
            message: 'Invalid date',
          },
          {
            code: 'invalid_type',
            expected: 'boolean',
            received: 'undefined',
            path: ['diet'],
            message: 'Required',
          },
        ],
        message: 'Validation issues!',
      };

      expect(mealCreateResponse.status).toBe(400);
      expect(mealCreateResponse.body).toEqual(expectedResponseBody);
    });

    it('should be able to create a meal', async () => {
      const mealCreateResponse = await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[0]);

      const expectedResponseBody = {
        message: 'Meal created!',
      };

      expect(mealCreateResponse.status).toBe(201);
      expect(mealCreateResponse.body).toEqual(expectedResponseBody);
    });
  });

  describe('GET:meals/', () => {
    it("should be able to list all user's meals", async () => {
      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[0]);

      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[1]);

      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[2]);

      const {
        body: { meals },
      } = await request(app.server)
        .get('/meals')
        .set('Authorization', credentials.userAToken);

      expect(meals[0]).toMatchObject(validInputMeals[0]);
      expect(meals[1]).toMatchObject(validInputMeals[1]);
      expect(meals[2]).toMatchObject(validInputMeals[2]);
    });
  });

  describe('GET:meals/:id', () => {
    it('should not be able to list a meal that does not exist', async () => {
      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[0]);

      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[1]);

      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[2]);

      const getMealResponse = await request(app.server)
        .get('/meals/asds-aasd-asdad-asdasd')
        .set('Authorization', credentials.userAToken);

      expect(getMealResponse.status).toBe(404);
      expect(getMealResponse.body.message).toBe('Meal not found!');
    });

    it('should be able to list a meal', async () => {
      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[0]);

      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[1]);

      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[2]);

      const {
        body: { meals },
      } = await request(app.server)
        .get('/meals')
        .set('Authorization', credentials.userAToken);

      const getMealResponse = await request(app.server)
        .get(`/meals/${meals[1].id as string}`)
        .set('Authorization', credentials.userAToken);

      expect(getMealResponse.status).toBe(200);
      expect(getMealResponse.body.meal).toEqual(meals[1]);
    });
  });

  describe('GET:meals/statistics', () => {
    it("should be able to get an user's statistics", async () => {
      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[0]);

      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[1]);

      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[2]);

      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[3]);

      const getStatisticsResponse = await request(app.server)
        .get('/meals/statistics')
        .set('Authorization', credentials.userAToken);

      const expectedStatistics = {
        meals_total: 4,
        meals_on_diet_total: 3,
        meals_off_diet_total: 1,
        best_sequence_meals_on_diet: 2,
      };

      expect(getStatisticsResponse.status).toBe(200);
      expect(getStatisticsResponse.body.statistics).toEqual(expectedStatistics);
    });
  });

  describe('PUT:meals/:id', () => {
    it('should not be able to edit a meal with invalid data', async () => {
      const editMealResponse = await request(app.server)
        .put('/meals/asdf-asdf-asdf-asdf')
        .set('Authorization', credentials.userAToken)
        .send({
          name: 123,
          description: 123,
          datetime: 'asd',
          diet: 'true',
        });

      const expectedResponse = {
        issues: [
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'number',
            path: ['name'],
            message: 'Expected string, received number',
          },
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'number',
            path: ['description'],
            message: 'Expected string, received number',
          },
          {
            code: 'invalid_date',
            path: ['datetime'],
            message: 'Invalid date',
          },
          {
            code: 'invalid_type',
            expected: 'boolean',
            received: 'string',
            path: ['diet'],
            message: 'Expected boolean, received string',
          },
        ],
        message: 'Validation issues!',
      };

      expect(editMealResponse.status).toBe(400);
      expect(editMealResponse.body).toEqual(expectedResponse);
    });

    it('should not be able to edit a meal with no data', async () => {
      const editMealResponse = await request(app.server)
        .put('/meals/asdf-asdf-asdf-asdf')
        .set('Authorization', credentials.userAToken)
        .send({
          whatever: true,
        });

      expect(editMealResponse.status).toBe(400);
      expect(editMealResponse.body.message).toBe('No data to edit!');
    });

    it('should not be able to edit a meal that does not exist', async () => {
      const editMealResponse = await request(app.server)
        .put('/meals/asdf-asdf-asdf-asdf')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[0]);

      expect(editMealResponse.status).toBe(404);
      expect(editMealResponse.body.message).toBe('Meal not found!');
    });

    it('should be able to edit a meal', async () => {
      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[0]);

      const {
        body: { meals },
      } = await request(app.server)
        .get('/meals')
        .set('Authorization', credentials.userAToken);

      const editMealResponse = await request(app.server)
        .put(`/meals/${meals[0].id as string}`)
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[1]);

      const {
        body: { meal: editedMeal },
      } = await request(app.server)
        .get(`/meals/${meals[0].id as string}`)
        .set('Authorization', credentials.userAToken);

      expect(editMealResponse.status).toBe(200);
      expect(editMealResponse.body.message).toBe('Meal updated!');
      expect(editedMeal).toMatchObject(validInputMeals[1]);
    });
  });

  describe('DELETE:meals/:id', () => {
    it('should not be able to delete a meal that does not exist', async () => {
      const deleteMealResponse = await request(app.server)
        .delete('/meals/asdf-asdf-asdf-asdf')
        .set('Authorization', credentials.userAToken);

      expect(deleteMealResponse.status).toBe(404);
      expect(deleteMealResponse.body.message).toEqual('Meal not found!');
    });

    it('should be able to delete a meal', async () => {
      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[0]);

      const {
        body: {
          meals: [myMeal],
        },
      } = await request(app.server)
        .get('/meals')
        .set('Authorization', credentials.userAToken);

      const deleteMealResponse = await request(app.server)
        .delete(`/meals/${myMeal.id as string}`)
        .set('Authorization', credentials.userAToken);

      const getMealResponse = await request(app.server)
        .get(`/meals/${myMeal.id as string}`)
        .set('Authorization', credentials.userAToken);

      expect(deleteMealResponse.status).toBe(200);
      expect(deleteMealResponse.body.message).toEqual('Meal deleted!');
      expect(getMealResponse.status).toBe(404);
      expect(getMealResponse.body.message).toEqual('Meal not found!');
    });

    it('should not be able to delete a meal of another user', async () => {
      await request(app.server)
        .post('/meals')
        .set('Authorization', credentials.userAToken)
        .send(validInputMeals[0]);

      const {
        body: {
          meals: [myMeal],
        },
      } = await request(app.server)
        .get('/meals')
        .set('Authorization', credentials.userAToken);

      const deleteMealResponse = await request(app.server)
        .delete(`/meals/${myMeal.id as string}`)
        .set('Authorization', credentials.userBToken);

      const getMealResponse = await request(app.server)
        .get(`/meals/${myMeal.id as string}`)
        .set('Authorization', credentials.userAToken);

      expect(deleteMealResponse.status).toBe(404);
      expect(deleteMealResponse.body.message).toEqual('Meal not found!');
      expect(getMealResponse.status).toBe(200);
      expect(getMealResponse.body.meal).toMatchObject(validInputMeals[0]);
    });
  });
});
