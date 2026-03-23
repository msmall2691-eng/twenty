import twilio from 'twilio';

type SmsPayload = {
  to: string;
  message: string;
};

function getClient() {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('Twilio credentials not configured – SMS will not be sent');
    return null;
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function sendSms(payload: SmsPayload): Promise<boolean> {
  const client = getClient();
  if (!client) return false;

  if (!process.env.TWILIO_FROM_PHONE) {
    console.warn('TWILIO_FROM_PHONE not configured');
    return false;
  }

  try {
    await client.messages.create({
      body: payload.message,
      from: process.env.TWILIO_FROM_PHONE,
      to: payload.to,
    });
    return true;
  } catch (error) {
    console.error('SMS send error:', error);
    return false;
  }
}
