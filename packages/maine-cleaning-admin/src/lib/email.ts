import nodemailer from 'nodemailer';

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

// Create SMTP transporter from environment config
function getTransporter() {
  if (!process.env.EMAIL_HOST) {
    console.warn('EMAIL_HOST not configured – email will not be sent');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT ?? '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM ?? 'noreply@mainecleaning.company',
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html ?? textToHtml(payload.text),
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// Simple text-to-HTML conversion
function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const body = escaped
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; }
  .header { background: #1d4ed8; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
  .content { padding: 20px; background: #fff; border: 1px solid #e5e7eb; }
  .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-radius: 0 0 8px 8px; }
</style>
</head>
<body>
  <div class="header">
    <h2 style="margin:0">The Maine Cleaning Company</h2>
  </div>
  <div class="content">
    <p>${body}</p>
  </div>
  <div class="footer">
    <p>The Maine Cleaning Company | (207) 555-0100 | mainecleaning.company</p>
  </div>
</body>
</html>`;
}
