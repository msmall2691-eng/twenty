import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { sendSms } from '@/lib/sms';
import { createSquareQuote } from '@/lib/square';
import { interpolateTemplate } from '@/lib/utils';

// GET /api/quotes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    const quotes = await prisma.quote.findMany({
      where: clientId ? { clientId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        lineItems: true,
      },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('GET /api/quotes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/quotes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const quote = await prisma.quote.create({
      data: {
        clientId: body.clientId,
        intakeRequestId: body.intakeRequestId ?? null,
        subtotal: body.subtotal ?? 0,
        taxRate: body.taxRate ?? 0,
        discount: body.discount ?? 0,
        total: body.total ?? 0,
        notes: body.notes ?? null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
        lineItems: {
          create: (body.lineItems ?? []).map((item: { description: string; quantity: number; unitPrice: number; total: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { client: true, lineItems: true },
    });

    // Optionally sync to Square
    if (process.env.SQUARE_ACCESS_TOKEN && body.syncSquare) {
      const squareQuoteId = await createSquareQuote(quote);
      if (squareQuoteId) {
        await prisma.quote.update({
          where: { id: quote.id },
          data: { squareQuoteId },
        });
      }
    }

    // Auto-send if requested
    if (body.sendVia) {
      await sendQuote(quote.id, body.sendVia);
    }

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('POST /api/quotes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper to send a quote (used internally)
async function sendQuote(quoteId: string, via: 'email' | 'sms' | 'both') {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { client: true, lineItems: true },
  });

  if (!quote) return;

  const defaultTemplate = await prisma.template.findFirst({
    where: { isDefault: true, type: via === 'sms' ? 'QUOTE_SMS' : 'QUOTE_EMAIL' },
  });

  const vars: Record<string, string> = {
    clientName: `${quote.client.firstName} ${quote.client.lastName}`,
    serviceType: quote.lineItems.map((li) => li.description).join(', '),
    total: quote.total.toFixed(2),
    notes: quote.notes ?? '',
    validUntil: quote.validUntil?.toLocaleDateString() ?? 'N/A',
  };

  if ((via === 'email' || via === 'both') && quote.client.email) {
    const subject = interpolateTemplate(
      defaultTemplate?.subject ?? 'Your Quote from The Maine Cleaning Company',
      vars,
    );
    const body = interpolateTemplate(
      defaultTemplate?.body ?? 'Please see your attached quote.',
      vars,
    );
    await sendEmail({ to: quote.client.email, subject, text: body });
  }

  if ((via === 'sms' || via === 'both') && quote.client.phone) {
    const smsTemplate = await prisma.template.findFirst({
      where: { isDefault: true, type: 'QUOTE_SMS' },
    });
    const message = interpolateTemplate(
      smsTemplate?.body ?? `Your quote is ready: $${quote.total}. Call (207) 555-0100 to confirm.`,
      vars,
    );
    await sendSms({ to: quote.client.phone, message });
  }

  await prisma.quote.update({
    where: { id: quoteId },
    data: { status: 'SENT', sentVia: via, sentAt: new Date() },
  });
}
