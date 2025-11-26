import knex, { type Knex } from 'knex'
import knexConfig from '../knexfile'

type Environment = 'development' | 'test' | 'production'

function resolveEnvironment(): Environment {
  const env = process.env.NODE_ENV
  if (env === 'test' || env === 'production') {
    return env
  }
  return 'development'
}

const environment: Environment = resolveEnvironment()
const config: Knex.Config = knexConfig[environment]

export const db = knex(config)