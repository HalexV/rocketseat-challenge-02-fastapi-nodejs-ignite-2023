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
});
