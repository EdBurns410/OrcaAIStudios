const sgMail = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'edwardburns210@gmail.com';
const FROM_EMAIL = process.env.FROM_EMAIL || ADMIN_EMAIL;
const CALENDAR_URL = process.env.CALENDAR_URL || 'https://calendar.app.google/qMxCJGDQfZHjKJRZ6';
const LEAD_MAGNET_URL = process.env.LEAD_MAGNET_URL;

const formatValue = (value) => {
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
    }
    return value || '';
};

exports.handler = async (event) => {
    if (!SENDGRID_API_KEY) {
        console.error('SENDGRID_API_KEY not set');
        return { statusCode: 500, body: 'Missing API Key' };
    }

    sgMail.setApiKey(SENDGRID_API_KEY);

    try {
        const body = event.body ? JSON.parse(event.body) : {};
        const payload = body.payload || {};
        const data = payload.data || {};
        const formName = payload.form_name || payload.formName || 'unknown';

        const email = data.email || data.Email || '';
        const name = data.name || data.full_name || data.fullName || 'there';

        const isLeadMagnet = formName === 'lead-magnet';

        const clientSubject = isLeadMagnet
            ? 'Your Zero-Man Business Skill Pack'
            : 'Orca AI Studios - Request Received';

        const leadMagnetCta = LEAD_MAGNET_URL
            ? `<a href="${LEAD_MAGNET_URL}" style="background-color: #00f0ff; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Download the Pack</a>`
            : `<p style="color: #b6c2d9;">Reply to this email and I’ll send the pack personally.</p>`;

        const clientHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #000; color: #fff; padding: 24px; border-radius: 10px;">
        <h2 style="color: #00f0ff; margin-bottom: 16px;">${isLeadMagnet ? 'Pack Delivered' : 'Request Received'}</h2>
        <p>Hi ${name || 'there'},</p>
        ${isLeadMagnet
                ? `<p>Your Zero-Man Business Skill Pack is ready. It shows the fastest path to reclaim 10–30 hours/week by replacing manual ops.</p>`
                : `<p>Thanks for reaching out. Your request will be reviewed soon.</p>`}
        ${isLeadMagnet ? `<div style="margin: 24px 0;">${leadMagnetCta}</div>` : ''}
        <p>If you'd like to move faster, book a quick call below:</p>
        <div style="margin: 24px 0;">
          <a href="${CALENDAR_URL}" style="background-color: #00f0ff; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Book a Call</a>
        </div>
        <p style="color: #888; font-size: 0.9em; margin-top: 32px; border-top: 1px solid #333; padding-top: 16px;">
          Orca AI Studios<br>
          Signal-first systems.
        </p>
      </div>
    `;

        const entries = Object.entries(data).map(([key, value]) => `${key}: ${formatValue(value)}`);
        const adminText = [`Form: ${formName}`, ...entries].join('\n');

        if (email) {
            await sgMail.send({
                to: email,
                from: FROM_EMAIL,
                subject: clientSubject,
                html: clientHtml,
            });
        } else {
            console.warn('No email found in submission data.');
        }

        await sgMail.send({
            to: ADMIN_EMAIL,
            from: FROM_EMAIL,
            subject: `New Lead (${formName})`,
            text: adminText,
            replyTo: email || undefined,
        });

        return { statusCode: 200, body: 'Email sent' };
    } catch (error) {
        console.error('Email Error:', error);
        return { statusCode: 500, body: error.toString() };
    }
};
