import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { triggerAutomations } from '@/lib/automations';

// POST /api/intake
// Receives intake form submissions from WW.MaineCleaning.Company
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret (set INTAKE_WEBHOOK_SECRET in .env)
    const secret = request.headers.get('x-webhook-secret');
    if (
      process.env.INTAKE_WEBHOOK_SECRET &&
      secret !== process.env.INTAKE_WEBHOOK_SECRET
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Create intake request in DB
    const intake = await prisma.intakeRequest.create({
      data: {
        firstName: body.firstName ?? '',
        lastName: body.lastName ?? '',
        email: body.email ?? '',
        phone: body.phone ?? null,
        address: body.address ?? null,
        city: body.city ?? null,
        state: body.state ?? 'ME',
        zip: body.zip ?? null,
        serviceType: body.serviceType ?? 'standard',
        frequency: body.frequency ?? null,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
        sqft: body.sqft ? parseInt(body.sqft) : null,
        preferredDate: body.preferredDate ? new Date(body.preferredDate) : null,
        notes: body.notes ?? null,
        status: 'NEW',
      },
    });

    // Fire automations for INTAKE_RECEIVED trigger
    await triggerAutomations('INTAKE_RECEIVED', intake);

    return NextResponse.json({ success: true, id: intake.id }, { status: 201 });
  } catch (error) {
    console.error('Intake webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/intake - List all intake requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const intakes = await prisma.intakeRequest.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });

    return NextResponse.json(intakes);
  } catch (error) {
    console.error('GET /api/intake error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
