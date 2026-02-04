const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { neon } = require('@netlify/neon');

// isAdminEmail removed - using password auth

exports.handler = async (event, context) => {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const providedPassword = event.headers['x-admin-password'];

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set in environment');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  if (providedPassword !== adminPassword) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid password' }),
    };
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const submissions = await sql`
      SELECT * FROM requests ORDER BY created_at DESC LIMIT 100
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
      body: JSON.stringify({
        form: {
          id: 'neon-requests',
          name: 'work-with-me',
        },
        submissions,
      }),
    };
  } catch (error) {
    console.error('DB Fetch Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch submissions from DB.' }),
    };
  }
};
