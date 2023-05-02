// eslint-disable-next-line
import { Knex } from 'knex';

declare module 'knex/types/tables' {
  interface User {
    id: string;
    email: string;
    password: string;
  }

  interface Meal {
    id: string;
    userId: string;
    name: string;
    description: string;
    datetime: string;
    diet: boolean;
  }

  interface Tables {
    users: User;
    meals: Meal;
  }
}
