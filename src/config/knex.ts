import Knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const db = Knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'hr_management',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  pool: { min: 2, max: 10 },
});

export default db;