const { neon } = require('@netlify/neon');

exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    try {
        const data = JSON.parse(event.body);
        const { name, email, company, project_type, budget, message } = data;

        if (!name || !email || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }

        // 1. Insert into Neon Database
        if (!process.env.DATABASE_URL) {
            console.error('DATABASE_URL is not set.');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Database configuration missing (DATABASE_URL).' }),
            };
        }

        const sql = neon(process.env.DATABASE_URL);
        await sql`
      INSERT INTO requests (name, email, company, project_type, budget, message)
      VALUES (${name}, ${email}, ${company}, ${project_type}, ${budget}, ${message})
    `;

        // 2. Proxy to Netlify Forms (to trigger email notification)
        // We construct a URL-encoded body as if it were a native form submission
        const formName = 'work-with-me';
        const params = new URLSearchParams();
        params.append('form-name', formName);
        params.append('name', name);
        params.append('email', email);
        params.append('company', company || '');
        params.append('project_type', project_type || '');
        params.append('budget', budget || '');
        params.append('message', message);

        // Post to the site's own form handler (Netlify intercepts this)
        // We assume the site is deployed, but locally we might not be able to trigger the email easily without full env.
        // In production, posting to "/" with proper headers works for Netlify Forms.
        // However, from a function, it's safer/cleaner to just rely on the DB if we can't easily proxy.
        // BUT the requirement is "get emailed".
        // Let's try to fetch the site URL.

        const siteUrl = process.env.URL || 'http://localhost:8888';
        try {
            await fetch(`${siteUrl}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });
        } catch (e) {
            console.error('Failed to proxy to Netlify Forms:', e);
            // We don't fail the request if email fails, DB is primary.
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Request received successfully' }),
        };

    } catch (error) {
        console.error('Error processing request:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
