import type { Knex } from "knex";

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "sqlite",
    connection: {
      filename: "src/db/app-data.db"
    },
    migrations: {
      directory: "src/db/migrations"
    },
    useNullAsDefault: true
  },

  test: {
    client: "sqlite",
    connection: {
      filename: "src/db/test.db"
    },
    migrations: {
      directory: "src/db/migrations"
    },
    useNullAsDefault: true
  },

  production: {
    client: "sqlite",
    connection: {
      filename: "src/db/production.db"
    },
    migrations: {
      directory: "src/db/migrations"
    },
    useNullAsDefault: true
  }
};

export default config; 