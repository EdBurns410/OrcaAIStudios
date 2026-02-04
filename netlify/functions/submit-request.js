const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
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
        const formName = 'work-with-me';
        const params = new URLSearchParams();
        params.append('form-name', formName);
        params.append('name', name);
        params.append('email', email);
        params.append('company', company || '');
        params.append('project_type', project_type || '');
        params.append('budget', budget || '');
        params.append('message', message);

        const siteUrl = process.env.URL || 'http://localhost:8888';
        try {
            await fetch(`${siteUrl}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });
        } catch (e) {
            console.error('Failed to proxy to Netlify Forms:', e);
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
