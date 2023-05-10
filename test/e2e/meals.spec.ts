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
    name: 'Test meal',
    description: 'A test meal',
    diet: true,
    datetime: new Date('2023-05-01T13:00:00.000Z').toISOString(),
  },
  {
    name: 'Test meal',
    description: 'A test meal',
    diet: false,
    datetime: new Date('2023-05-01T15:00:00.000Z').toISOString(),
  },
  {
    name: 'Test meal',
    description: 'A test meal',
    diet: true,
    datetime: new Date('2023-05-02T13:00:00.000Z').toISOString(),
  },
  {
    name: 'Test meal',
    description: 'A test meal',
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
});
