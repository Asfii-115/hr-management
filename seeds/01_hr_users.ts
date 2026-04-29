import { Knex } from 'knex';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
  await knex('hr_users').del();
  const passwordHash = await bcrypt.hash('admin123', 10);
  await knex('hr_users').insert([
    {
      email: 'admin@company.com',
      password_hash: passwordHash,
      name: 'HR Admin',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);
  console.log('✅ Seed: HR admin user created — email: admin@company.com | password: admin123');
}