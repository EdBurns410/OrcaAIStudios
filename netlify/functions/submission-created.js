const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

exports.handler = async (event) => {
    if (!SENDGRID_API_KEY) {
        console.error('SENDGRID_API_KEY not set');
        return { statusCode: 500, body: 'Missing API Key' };
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    try {
        const payload = JSON.parse(event.body).payload;
        const { name, email, message } = payload.data;

        console.log(`Sending email to ${email}...`);

        const clientMsg = {
            to: email,
            from: 'edwardburns210@gmail.com', // Must be verified in SendGrid
            subject: 'Orca AI Studios - Received',
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 20px; border-radius: 8px;">
            <h2 style="color: #00f0ff; margin-bottom: 20px;">Request Received</h2>
            <p>Hi ${name || 'there'},</p>
            <p>Thanks for reaching out. Your request will be reviewed soon.</p>
            <p>If you haven't already scheduled a call, please do so below:</p>
            
            <div style="margin: 30px 0;">
                <a href="https://calendar.app.google/qMxCJGDQfZHjKJRZ6" style="background-color: #00f0ff; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Book a Call</a>
            </div>

            <p style="color: #888; font-size: 0.9em; margin-top: 40px; border-top: 1px solid #333; padding-top: 20px;">
                Orca AI Studios<br>
                Signal-first systems.
            </p>
        </div>
      `,
        };

        const adminMsg = {
            to: 'edwardburns210@gmail.com',
            from: 'edwardburns210@gmail.com',
            subject: `New Lead: ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
        };

        await sgMail.send(clientMsg);
        await sgMail.send(adminMsg);

        return { statusCode: 200, body: 'Email sent' };

    } catch (error) {
        console.error('Email Error:', error);
        return { statusCode: 500, body: error.toString() };
    }
};
