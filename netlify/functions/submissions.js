const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { neon } = require('@netlify/neon');

exports.handler = async (event, context) => {
  console.log('Function: submissions started');

  const adminPassword = process.env.ADMIN_PASSWORD;
  const dbUrl = process.env.DATABASE_URL;
  const providedPassword = event.headers['x-admin-password'];

  // Debugging Envs
  if (!adminPassword) {
    console.error('CRITICAL: ADMIN_PASSWORD is missing from env');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Configuration Error: ADMIN_PASSWORD is not set.' }),
    };
  }

  if (!dbUrl) {
    console.error('CRITICAL: DATABASE_URL is missing from env');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Configuration Error: DATABASE_URL is not set.' }),
    };
  }

  if (providedPassword !== adminPassword) {
    console.warn('Auth Failed: Incorrect password provided');
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid password' }),
    };
  }

  try {
    const sql = neon(dbUrl);
    const submissions = await sql`
      SELECT * FROM requests ORDER BY created_at DESC LIMIT 100
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({
        submissions,
      }),
    };
  } catch (error) {
    console.error('Database Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `Database Error: ${error.message}`,
        details: error.stack
      }),
    };
  }
};
