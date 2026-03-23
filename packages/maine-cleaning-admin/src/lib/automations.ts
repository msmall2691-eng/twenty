import { prisma } from './prisma';
import { sendEmail } from './email';
import { sendSms } from './sms';
import { interpolateTemplate } from './utils';

type TriggerType =
  | 'INTAKE_RECEIVED'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_EXPIRED'
  | 'JOB_SCHEDULED'
  | 'JOB_COMPLETED'
  | 'INVOICE_CREATED'
  | 'INVOICE_OVERDUE'
  | 'CLIENT_CREATED'
  | 'MANUAL';

type ActionConfig = {
  type: string;
  templateType?: string;
  to?: string;
  via?: string;
  fromQuote?: boolean;
  fromJob?: boolean;
  delay?: string;
  condition?: string;
};

// Fire all active automations matching a trigger
export async function triggerAutomations(
  trigger: TriggerType,
  data: Record<string, unknown>,
): Promise<void> {
  const automations = await prisma.automation.findMany({
    where: {
      isActive: true,
      trigger,
    },
  });

  for (const automation of automations) {
    try {
      const actions: ActionConfig[] = JSON.parse(automation.actions);
      for (const action of actions) {
        await executeAction(action, data);
      }

      // Update run stats
      await prisma.automation.update({
        where: { id: automation.id },
        data: {
          runCount: { increment: 1 },
          lastRunAt: new Date(),
        },
      });

      await prisma.automationLog.create({
        data: {
          automationId: automation.id,
          status: 'success',
          message: `Automation "${automation.name}" ran successfully`,
          data: JSON.stringify(data),
        },
      });
    } catch (error) {
      console.error(`Automation "${automation.name}" failed:`, error);
      await prisma.automationLog.create({
        data: {
          automationId: automation.id,
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}

async function executeAction(action: ActionConfig, data: Record<string, unknown>): Promise<void> {
  // Build template variables from data
  const vars = flattenObject(data);

  switch (action.type) {
    case 'SEND_EMAIL': {
      if (!action.templateType) break;

      const template = await prisma.template.findFirst({
        where: { type: action.templateType as never, isDefault: true },
      });

      if (!template) break;

      const to = interpolateTemplate(action.to ?? '{{email}}', vars);
      if (!to) break;

      const subject = interpolateTemplate(template.subject ?? '', vars);
      const body = interpolateTemplate(template.body, vars);

      await sendEmail({ to, subject, text: body });
      break;
    }

    case 'SEND_SMS': {
      if (!action.templateType) break;

      const template = await prisma.template.findFirst({
        where: { type: action.templateType as never, isDefault: true },
      });

      if (!template) break;

      const to = interpolateTemplate(action.to ?? '{{phone}}', vars);
      if (!to) break;

      const message = interpolateTemplate(template.body, vars);
      await sendSms({ to, message });
      break;
    }

    case 'SYNC_GOOGLE_CALENDAR':
    case 'SYNC_CONNECT_TEAM':
    case 'CREATE_JOB':
    case 'CREATE_INVOICE':
    case 'UPDATE_STATUS':
    case 'NOTIFY_ADMIN':
      // These are handled by specific API routes
      console.log(`Action ${action.type} queued for execution`);
      break;

    default:
      console.warn(`Unknown automation action: ${action.type}`);
  }
}

// Flatten a nested object to dot-notation keys
function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = value instanceof Date ? value.toLocaleDateString() : String(value ?? '');
    }
  }

  return result;
}
