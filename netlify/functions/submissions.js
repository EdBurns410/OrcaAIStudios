const { neon } = require('@netlify/neon');

const isAdminEmail = async (email) => {
  if (!email) return false;
  const sql = neon(process.env.DATABASE_URL);
  try {
    const rows = await sql`
      SELECT email, role
      FROM admin_users
      WHERE email = ${email} AND role = 'admin'
      LIMIT 1
    `;
    return rows.length > 0;
  } catch (err) {
    console.error('Admin Check Error:', err);
    return false;
  }
};

exports.handler = async (event, context) => {
  const user = context.clientContext && context.clientContext.user;

  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized.' }),
    };
  }

  try {
    const allowed = await isAdminEmail(user.email);
    if (!allowed) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden.' }),
      };
    }
  } catch (error) {
    console.error('Auth Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Admin validation failed.' }),
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
