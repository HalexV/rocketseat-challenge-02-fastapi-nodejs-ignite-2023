import { it, beforeAll, afterAll, describe, expect, beforeEach } from 'vitest';
import request from 'supertest';

import { execSync } from 'node:child_process';
import { app } from '../../src/app';
import { knex } from '../../src/database';

describe('Users routes', () => {
  beforeAll(async () => {
    execSync('npm run knex migrate:latest');
    await app.ready();
  });

  afterAll(async () => {
    execSync('npm run knex migrate:rollback --all');
    await app.close();
  });

  beforeEach(async () => {
    await knex('users').del();
  });

  describe('POST:users/', () => {
    it('should be able to create a new user', async () => {
      const userCreateResponse = await request(app.server).post('/users').send({
        email: 'test@test.com',
        password: 'abc1234',
      });

      const expectedResponseBody = {
        message: 'User created!',
      };

      expect(userCreateResponse.status).toBe(201);
      expect(userCreateResponse.body).toEqual(expectedResponseBody);
    });

    it('should not be able to create a new user with invalid data', async () => {
      const userCreateResponse = await request(app.server).post('/users').send({
        email: 'test.test.com',
        password: 'abc',
      });

      const expectedResponseBody = {
        issues: [
          {
            validation: 'email',
            code: 'invalid_string',
            message: 'Invalid email',
            path: ['email'],
          },
          {
            code: 'too_small',
            minimum: 6,
            type: 'string',
            inclusive: true,
            exact: false,
            message: 'String must contain at least 6 character(s)',
            path: ['password'],
          },
        ],
        message: 'Validation issues!',
      };

      expect(userCreateResponse.status).toBe(400);
      expect(userCreateResponse.body).toEqual(expectedResponseBody);
    });

    it('should not be able to create a new user that already exists', async () => {
      await request(app.server).post('/users').send({
        email: 'test@test.com',
        password: 'abc1234',
      });

      const userCreateResponse = await request(app.server).post('/users').send({
        email: 'test@test.com',
        password: 'abc1234',
      });

      const expectedResponseBody = {
        message: 'User already exists!',
      };

      expect(userCreateResponse.status).toBe(400);
      expect(userCreateResponse.body).toEqual(expectedResponseBody);
    });
  });

  describe('POST:users/authenticate', () => {
    it('should not be able to authenticate an user with invalid data', async () => {
      const userAuthenticateResponse = await request(app.server)
        .post('/users/authenticate')
        .send({
          email: 'test.test.com',
          password: 123,
        });

      const expectedResponseBody = {
        issues: [
          {
            validation: 'email',
            code: 'invalid_string',
            message: 'Invalid email',
            path: ['email'],
          },
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'number',
            path: ['password'],
            message: 'Expected string, received number',
          },
        ],
        message: 'Validation issues!',
      };

      expect(userAuthenticateResponse.status).toBe(400);
      expect(userAuthenticateResponse.body).toEqual(expectedResponseBody);
    });

    it('should not be able to authenticate an user with wrong password', async () => {
      await request(app.server).post('/users').send({
        email: 'test@test.com',
        password: 'abc1234',
      });

      const userAuthenticateResponse = await request(app.server)
        .post('/users/authenticate')
        .send({
          email: 'test@test.com',
          password: 'abc1235',
        });

      const expectedResponseBody = {
        message: 'Email or password incorrect!',
      };

      expect(userAuthenticateResponse.status).toBe(400);
      expect(userAuthenticateResponse.body).toEqual(expectedResponseBody);
    });

    it('should be able to authenticate an user', async () => {
      await request(app.server).post('/users').send({
        email: 'test@test.com',
        password: 'abc1234',
      });

      const userAuthenticateResponse = await request(app.server)
        .post('/users/authenticate')
        .send({
          email: 'test@test.com',
          password: 'abc1234',
        });

      expect(userAuthenticateResponse.status).toBe(200);
      expect(userAuthenticateResponse.body.message).toBe('User authenticated!');
      expect(userAuthenticateResponse.body).toHaveProperty('token');
      expect(typeof userAuthenticateResponse.body.token).toBe('string');
    });
  });
});
