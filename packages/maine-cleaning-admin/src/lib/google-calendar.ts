import { google } from 'googleapis';
import type { Job } from '@prisma/client';

function getOAuthClient() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return null;
  }
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

  // Tokens should be stored per user in production (DB or session)
  // For simplicity, using environment variable here
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  }

  return auth;
}

// Create an event in Google Calendar when a job is scheduled
export async function createGoogleCalendarEvent(
  job: Job & { client: { firstName: string; lastName: string; email: string } },
): Promise<string | null> {
  const auth = getOAuthClient();
  if (!auth) return null;

  try {
    const calendar = google.calendar({ version: 'v3', auth });

    const startTime = new Date(job.scheduledAt);
    const endTime = new Date(startTime.getTime() + job.duration * 60 * 1000);

    const event = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID ?? 'primary',
      requestBody: {
        summary: `🧹 ${job.serviceType} – ${job.client.firstName} ${job.client.lastName}`,
        description: [
          `Client: ${job.client.firstName} ${job.client.lastName}`,
          `Service: ${job.serviceType}`,
          `Address: ${job.address ?? 'N/A'}`,
          job.notes ? `Notes: ${job.notes}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        location: job.address ?? undefined,
        start: { dateTime: startTime.toISOString() },
        end: { dateTime: endTime.toISOString() },
        attendees: [{ email: job.client.email }],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24h before
            { method: 'popup', minutes: 60 },        // 1h before
          ],
        },
      },
    });

    return event.data.id ?? null;
  } catch (error) {
    console.error('Google Calendar create event error:', error);
    return null;
  }
}

// Update existing calendar event
export async function updateGoogleCalendarEvent(
  eventId: string,
  updates: { startTime?: Date; endTime?: Date; title?: string; location?: string },
): Promise<boolean> {
  const auth = getOAuthClient();
  if (!auth) return false;

  try {
    const calendar = google.calendar({ version: 'v3', auth });

    const patch: Record<string, unknown> = {};
    if (updates.title) patch.summary = updates.title;
    if (updates.location) patch.location = updates.location;
    if (updates.startTime) patch.start = { dateTime: updates.startTime.toISOString() };
    if (updates.endTime) patch.end = { dateTime: updates.endTime.toISOString() };

    await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID ?? 'primary',
      eventId,
      requestBody: patch,
    });

    return true;
  } catch (error) {
    console.error('Google Calendar update event error:', error);
    return false;
  }
}

// Delete calendar event (on job cancellation)
export async function deleteGoogleCalendarEvent(eventId: string): Promise<boolean> {
  const auth = getOAuthClient();
  if (!auth) return false;

  try {
    const calendar = google.calendar({ version: 'v3', auth });
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID ?? 'primary',
      eventId,
    });
    return true;
  } catch (error) {
    console.error('Google Calendar delete event error:', error);
    return false;
  }
}

// Generate OAuth authorization URL (for initial setup)
export function getGoogleAuthUrl(): string {
  const auth = getOAuthClient();
  if (!auth) return '';

  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
  });
}
