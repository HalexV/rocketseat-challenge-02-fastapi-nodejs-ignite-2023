import { type Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary();
    table.uuid('userId').notNullable();
    table.text('name').notNullable();
    table.text('description').notNullable();
    table.datetime('datetime').notNullable();
    table.boolean('diet').notNullable();
    table.foreign('userId').references('id').inTable('users');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals');
}
