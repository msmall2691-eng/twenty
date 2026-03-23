import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    const clients = await prisma.client.findMany({
      where: q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
              { city: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { quotes: true, jobs: true } },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('GET /api/clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/clients
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const existing = await prisma.client.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json(
        { error: 'A client with this email already exists' },
        { status: 409 },
      );
    }

    const client = await prisma.client.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone ?? null,
        address: body.address ?? null,
        city: body.city ?? null,
        state: body.state ?? 'ME',
        zip: body.zip ?? null,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('POST /api/clients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
