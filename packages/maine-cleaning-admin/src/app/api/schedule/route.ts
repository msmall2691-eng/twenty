import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createGoogleCalendarEvent } from '@/lib/google-calendar';
import { createConnectTeamShift } from '@/lib/connect-team';

// GET /api/schedule
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const jobs = await prisma.job.findMany({
      where: {
        scheduledAt: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      orderBy: { scheduledAt: 'asc' },
      include: { client: true, quote: true },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('GET /api/schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/schedule - Create a new job
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const job = await prisma.job.create({
      data: {
        clientId: body.clientId,
        quoteId: body.quoteId ?? null,
        title: body.title ?? body.serviceType,
        address: body.address ?? null,
        scheduledAt: new Date(body.scheduledAt),
        duration: body.duration ?? 120,
        serviceType: body.serviceType,
        notes: body.notes ?? null,
        assignedTo: body.assignedTo ? JSON.stringify(body.assignedTo) : null,
        status: 'SCHEDULED',
      },
      include: { client: true },
    });

    // Sync to Google Calendar if configured
    if (body.syncGoogleCalendar !== false && process.env.GOOGLE_CLIENT_ID) {
      const eventId = await createGoogleCalendarEvent(job);
      if (eventId) {
        await prisma.job.update({
          where: { id: job.id },
          data: { googleEventId: eventId },
        });
      }
    }

    // Push to ConnectTeam if configured
    if (body.syncConnectTeam !== false && process.env.CONNECT_TEAM_API_KEY) {
      const shiftId = await createConnectTeamShift(job);
      if (shiftId) {
        await prisma.job.update({
          where: { id: job.id },
          data: { connectTeamShiftId: shiftId },
        });
      }
    }

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error('POST /api/schedule error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
