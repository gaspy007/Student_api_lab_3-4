import { Pool } from 'pg';

 
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is missing. Check your .env file.');
}
 
export const pool = new Pool({ connectionString: databaseUrl });