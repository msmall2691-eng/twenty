import { Client, Environment } from 'square';
import type { Quote, Job } from '@prisma/client';

function getSquareClient() {
  if (!process.env.SQUARE_ACCESS_TOKEN) {
    console.warn('Square access token not configured');
    return null;
  }
  return new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment:
      process.env.SQUARE_ENVIRONMENT === 'production'
        ? Environment.Production
        : Environment.Sandbox,
  });
}

type QuoteWithItems = Quote & {
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
  client: { firstName: string; lastName: string; email: string };
};

// Create a Square Estimate (quote)
export async function createSquareQuote(quote: QuoteWithItems): Promise<string | null> {
  const client = getSquareClient();
  if (!client || !process.env.SQUARE_LOCATION_ID) return null;

  try {
    const { result } = await client.ordersApi.createOrder({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        referenceId: quote.id,
        lineItems: quote.lineItems.map((item) => ({
          name: item.description,
          quantity: item.quantity.toString(),
          basePriceMoney: {
            amount: BigInt(Math.round(item.unitPrice * 100)),
            currency: 'USD',
          },
        })),
        discounts: quote.discount > 0
          ? [{
              name: 'Discount',
              amountMoney: { amount: BigInt(Math.round(quote.discount * 100)), currency: 'USD' },
              scope: 'ORDER',
            }]
          : [],
        taxes: quote.taxRate > 0
          ? [{
              name: 'Tax',
              percentage: quote.taxRate.toString(),
              scope: 'ORDER',
            }]
          : [],
        state: 'DRAFT',
      },
      idempotencyKey: `quote-${quote.id}-${Date.now()}`,
    });

    return result.order?.id ?? null;
  } catch (error) {
    console.error('Square create quote error:', error);
    return null;
  }
}

type JobWithClient = Job & {
  client: { firstName: string; lastName: string; email: string };
};

// Create a Square Invoice from a completed job
export async function createSquareInvoice(
  job: JobWithClient,
  amount: number,
): Promise<string | null> {
  const client = getSquareClient();
  if (!client || !process.env.SQUARE_LOCATION_ID) return null;

  try {
    // First create an order
    const { result: orderResult } = await client.ordersApi.createOrder({
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        referenceId: job.id,
        lineItems: [{
          name: job.serviceType,
          quantity: '1',
          basePriceMoney: {
            amount: BigInt(Math.round(amount * 100)),
            currency: 'USD',
          },
        }],
        state: 'OPEN',
      },
      idempotencyKey: `invoice-${job.id}-${Date.now()}`,
    });

    if (!orderResult.order?.id) return null;

    // Create invoice from order
    const { result: invoiceResult } = await client.invoicesApi.createInvoice({
      invoice: {
        orderId: orderResult.order.id,
        primaryRecipient: {
          emailAddress: job.client.email,
          givenName: job.client.firstName,
          familyName: job.client.lastName,
        },
        paymentRequests: [{
          requestType: 'BALANCE',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          automaticPaymentSource: 'NONE',
        }],
        deliveryMethod: 'EMAIL',
        title: `Cleaning Service – ${job.serviceType}`,
        description: `Service provided on ${new Date(job.scheduledAt).toLocaleDateString()}`,
      },
      idempotencyKey: `square-invoice-${job.id}-${Date.now()}`,
    });

    return invoiceResult.invoice?.id ?? null;
  } catch (error) {
    console.error('Square create invoice error:', error);
    return null;
  }
}

// Publish and send a Square Invoice
export async function publishSquareInvoice(squareInvoiceId: string): Promise<boolean> {
  const client = getSquareClient();
  if (!client) return false;

  try {
    const { result: getResult } = await client.invoicesApi.getInvoice(squareInvoiceId);
    const version = getResult.invoice?.version ?? 0;

    await client.invoicesApi.publishInvoice(squareInvoiceId, {
      version,
      idempotencyKey: `publish-${squareInvoiceId}-${Date.now()}`,
    });
    return true;
  } catch (error) {
    console.error('Square publish invoice error:', error);
    return false;
  }
}
