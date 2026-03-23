import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Maine Cleaning Admin database...');

  // Seed default templates
  await prisma.template.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Quote Email - Standard',
        type: 'QUOTE_EMAIL',
        subject: 'Your Cleaning Quote from The Maine Cleaning Company',
        body: `Hi {{clientName}},

Thank you for reaching out to The Maine Cleaning Company! We're excited to help keep your space spotless.

Here is your personalized quote:

Service: {{serviceType}}
Date: {{scheduledDate}}
Estimated Total: ${{total}}

{{notes}}

This quote is valid until {{validUntil}}.

To accept this quote, simply reply to this email or call us at (207) 555-0100.

Best regards,
The Maine Cleaning Company Team
📞 (207) 555-0100 | 🌐 mainecleaning.company`,
        isDefault: true,
        variables: JSON.stringify(['clientName', 'serviceType', 'scheduledDate', 'total', 'notes', 'validUntil']),
      },
      {
        name: 'Quote SMS',
        type: 'QUOTE_SMS',
        body: `Hi {{clientName}}! Your Maine Cleaning Co. quote is ready: ${{total}} for {{serviceType}} on {{scheduledDate}}. Reply YES to confirm or call (207) 555-0100. Valid until {{validUntil}}.`,
        isDefault: true,
        variables: JSON.stringify(['clientName', 'serviceType', 'scheduledDate', 'total', 'validUntil']),
      },
      {
        name: 'Invoice Email',
        type: 'INVOICE_EMAIL',
        subject: 'Invoice #{{invoiceNumber}} from The Maine Cleaning Company',
        body: `Hi {{clientName}},

Thank you for choosing The Maine Cleaning Company!

Invoice #: {{invoiceNumber}}
Service Date: {{serviceDate}}
Amount Due: ${{total}}
Due Date: {{dueDate}}

{{notes}}

Pay securely online: {{paymentLink}}

Thank you for your business!

The Maine Cleaning Company
📞 (207) 555-0100`,
        isDefault: true,
        variables: JSON.stringify(['clientName', 'invoiceNumber', 'serviceDate', 'total', 'dueDate', 'notes', 'paymentLink']),
      },
      {
        name: 'Appointment Reminder',
        type: 'REMINDER_EMAIL',
        subject: 'Reminder: Cleaning Appointment Tomorrow',
        body: `Hi {{clientName}},

Just a friendly reminder that your cleaning appointment is scheduled for tomorrow!

📅 Date: {{scheduledDate}}
🕐 Time: {{scheduledTime}}
📍 Address: {{address}}

Our team will arrive within a 30-minute window of your scheduled time.

Questions? Reply to this email or call (207) 555-0100.

See you tomorrow!
The Maine Cleaning Company`,
        isDefault: true,
        variables: JSON.stringify(['clientName', 'scheduledDate', 'scheduledTime', 'address']),
      },
      {
        name: 'Welcome Email',
        type: 'WELCOME_EMAIL',
        subject: 'Welcome to The Maine Cleaning Company! 🏠✨',
        body: `Hi {{clientName}},

Welcome to The Maine Cleaning Company! We're thrilled to have you as a new client.

Here's what happens next:
1. We'll review your request and send a quote within 24 hours
2. Once you approve, we'll schedule your first cleaning
3. Sit back and enjoy a spotless home!

Your first cleaning is scheduled for: {{scheduledDate}}

If you have any questions, don't hesitate to reach out:
📞 (207) 555-0100
📧 hello@mainecleaning.company
🌐 mainecleaning.company

Welcome to the family!
The Maine Cleaning Company Team`,
        isDefault: true,
        variables: JSON.stringify(['clientName', 'scheduledDate']),
      },
    ],
  });

  // Seed sample clients
  const client1 = await prisma.client.upsert({
    where: { email: 'sarah.johnson@example.com' },
    update: {},
    create: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@example.com',
      phone: '(207) 555-0201',
      address: '42 Pine Street',
      city: 'Portland',
      state: 'ME',
      zip: '04101',
    },
  });

  const client2 = await prisma.client.upsert({
    where: { email: 'michael.chen@example.com' },
    update: {},
    create: {
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@example.com',
      phone: '(207) 555-0342',
      address: '15 Harbor View Drive',
      city: 'Kennebunkport',
      state: 'ME',
      zip: '04046',
    },
  });

  // Seed sample intake requests
  await prisma.intakeRequest.createMany({
    skipDuplicates: true,
    data: [
      {
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.watson@example.com',
        phone: '(207) 555-0123',
        address: '88 Ocean Avenue',
        city: 'Bar Harbor',
        state: 'ME',
        zip: '04609',
        serviceType: 'deep',
        frequency: 'one-time',
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1800,
        notes: 'Moving in next month, need deep clean before furniture arrives.',
        status: 'NEW',
      },
      {
        firstName: 'Robert',
        lastName: 'Thompson',
        email: 'r.thompson@example.com',
        phone: '(207) 555-0987',
        address: '12 Maple Lane',
        city: 'Augusta',
        state: 'ME',
        zip: '04330',
        serviceType: 'standard',
        frequency: 'bi-weekly',
        bedrooms: 4,
        bathrooms: 3,
        sqft: 2400,
        notes: 'Looking for regular bi-weekly cleaning. Have two dogs.',
        status: 'REVIEWING',
      },
      {
        firstName: 'Jennifer',
        lastName: 'Park',
        email: 'j.park@example.com',
        phone: '(207) 555-0456',
        address: '305 Commercial Street',
        city: 'Rockland',
        state: 'ME',
        zip: '04841',
        serviceType: 'commercial',
        frequency: 'weekly',
        sqft: 3200,
        notes: 'Small office building, needs weekly cleaning Mon-Fri mornings.',
        status: 'QUOTED',
        clientId: client1.id,
      },
    ],
  });

  // Seed default automations
  await prisma.automation.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'New Intake → Send Welcome Email',
        description: 'Automatically send a welcome email when a new intake request is received',
        isActive: true,
        trigger: 'INTAKE_RECEIVED',
        actions: JSON.stringify([
          { type: 'SEND_EMAIL', templateType: 'WELCOME_EMAIL', to: '{{email}}' },
        ]),
      },
      {
        name: 'Quote Accepted → Schedule Job',
        description: 'Create a job and notify team when a quote is accepted',
        isActive: true,
        trigger: 'QUOTE_ACCEPTED',
        actions: JSON.stringify([
          { type: 'CREATE_JOB', fromQuote: true },
          { type: 'SYNC_GOOGLE_CALENDAR' },
          { type: 'SYNC_CONNECT_TEAM' },
        ]),
      },
      {
        name: 'Job Completed → Send Invoice',
        description: 'Automatically create and send invoice when a job is marked complete',
        isActive: true,
        trigger: 'JOB_COMPLETED',
        actions: JSON.stringify([
          { type: 'CREATE_INVOICE', fromJob: true },
          { type: 'SEND_EMAIL', templateType: 'INVOICE_EMAIL', to: '{{client.email}}' },
        ]),
      },
      {
        name: 'Appointment Reminder (24h)',
        description: 'Send reminder email 24 hours before scheduled appointment',
        isActive: true,
        trigger: 'JOB_SCHEDULED',
        conditions: JSON.stringify([{ field: 'hoursUntilJob', operator: 'eq', value: 24 }]),
        actions: JSON.stringify([
          { type: 'SEND_EMAIL', templateType: 'REMINDER_EMAIL', to: '{{client.email}}' },
          { type: 'SEND_SMS', templateType: 'REMINDER_SMS', to: '{{client.phone}}' },
        ]),
      },
      {
        name: 'Quote Expiring → Follow Up',
        description: 'Send follow-up when a quote is about to expire',
        isActive: false,
        trigger: 'QUOTE_EXPIRED',
        actions: JSON.stringify([
          { type: 'SEND_EMAIL', templateType: 'FOLLOW_UP_EMAIL', to: '{{client.email}}' },
        ]),
      },
    ],
  });

  console.log('✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
