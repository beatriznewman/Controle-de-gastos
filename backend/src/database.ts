import knex from 'knex'

export const db = knex({
  client: 'sqlite',
  connection: { filename: 'src/db/app-data.db' },
  useNullAsDefault: true,
})