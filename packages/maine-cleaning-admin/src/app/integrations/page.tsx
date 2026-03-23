'use client';

import { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';

type IntegrationStatus = 'connected' | 'disconnected' | 'partial';

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: IntegrationStatus;
  docsUrl: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'select';
    placeholder?: string;
    options?: string[];
    value: string;
    hint?: string;
  }[];
  features: string[];
};

const integrations: Integration[] = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync scheduled jobs to Google Calendar and keep your team updated in real-time.',
    icon: '📆',
    status: 'connected',
    docsUrl: 'https://developers.google.com/calendar',
    features: [
      'Auto-create calendar events when a job is scheduled',
      'Update events when job details change',
      'Delete events when jobs are cancelled',
      'Two-way sync for schedule changes',
    ],
    fields: [
      { key: 'GOOGLE_CLIENT_ID', label: 'Google OAuth Client ID', type: 'text', placeholder: 'your-client-id.apps.googleusercontent.com', value: '123456789-abc.apps.googleusercontent.com', hint: 'From Google Cloud Console > Credentials' },
      { key: 'GOOGLE_CLIENT_SECRET', label: 'Google OAuth Client Secret', type: 'password', placeholder: 'GOCSPX-...', value: 'configured', hint: 'Keep this secret' },
      { key: 'GOOGLE_CALENDAR_ID', label: 'Calendar ID', type: 'text', placeholder: 'primary or calendar@gmail.com', value: 'primary', hint: 'Use "primary" for your main calendar' },
    ],
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Create quotes, invoices, and process payments. Sync with Square Payroll for team pay.',
    icon: '◼',
    status: 'disconnected',
    docsUrl: 'https://developer.squareup.com/docs',
    features: [
      'Create and send Square Estimates (quotes)',
      'Auto-generate invoices from completed jobs',
      'Accept online payments via Square',
      'Square Payroll integration for cleaner wages',
      'View payment status from admin dashboard',
    ],
    fields: [
      { key: 'SQUARE_ACCESS_TOKEN', label: 'Square Access Token', type: 'password', placeholder: 'EAAAl...', value: '', hint: 'From Square Developer Dashboard' },
      { key: 'SQUARE_LOCATION_ID', label: 'Location ID', type: 'text', placeholder: 'LID...', value: '', hint: 'Your Square business location' },
      { key: 'SQUARE_ENVIRONMENT', label: 'Environment', type: 'select', options: ['sandbox', 'production'], value: 'sandbox', hint: 'Use sandbox for testing' },
    ],
  },
  {
    id: 'connect-team',
    name: 'ConnectTeam',
    description: 'Push job schedules to your cleaning crew. They can view shifts, clock in/out, and complete jobs.',
    icon: '👥',
    status: 'disconnected',
    docsUrl: 'https://connecteam.com/api',
    features: [
      'Push scheduled jobs as shifts to ConnectTeam',
      'Cleaners view their schedule on the ConnectTeam app',
      'Clock in / clock out tracking',
      'Job completion confirmation from the field',
      'Real-time status updates back to admin dashboard',
    ],
    fields: [
      { key: 'CONNECT_TEAM_API_KEY', label: 'ConnectTeam API Key', type: 'password', placeholder: 'ct_live_...', value: '', hint: 'From ConnectTeam Settings > Integrations > API' },
      { key: 'CONNECT_TEAM_API_URL', label: 'API URL', type: 'text', placeholder: 'https://api.connecteam.com/api/v1', value: 'https://api.connecteam.com/api/v1', hint: 'Leave as default unless directed otherwise' },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio (SMS)',
    description: 'Send SMS quotes, confirmations, and reminders directly to clients.',
    icon: '💬',
    status: 'connected',
    docsUrl: 'https://www.twilio.com/docs',
    features: [
      'Send quote notifications via SMS',
      'Appointment reminder text messages',
      'Invoice payment link via SMS',
      'Two-way SMS support (coming soon)',
    ],
    fields: [
      { key: 'TWILIO_ACCOUNT_SID', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxxx', value: 'AC1234567890abcdef', hint: 'From Twilio Console > Account Info' },
      { key: 'TWILIO_AUTH_TOKEN', label: 'Auth Token', type: 'password', placeholder: 'your-auth-token', value: 'configured', hint: 'Keep this secret' },
      { key: 'TWILIO_FROM_PHONE', label: 'From Phone Number', type: 'text', placeholder: '+12075550100', value: '+12075550100', hint: 'Your Twilio phone number' },
    ],
  },
  {
    id: 'email',
    name: 'Email (SMTP / SendGrid)',
    description: 'Send quotes, invoices, and reminders via email to clients.',
    icon: '📧',
    status: 'partial',
    docsUrl: 'https://docs.sendgrid.com',
    features: [
      'Send templated quote emails',
      'Invoice delivery via email',
      'Appointment confirmations and reminders',
      'Welcome emails for new clients',
    ],
    fields: [
      { key: 'EMAIL_HOST', label: 'SMTP Host', type: 'text', placeholder: 'smtp.sendgrid.net', value: 'smtp.sendgrid.net', hint: 'SendGrid, Mailgun, or any SMTP provider' },
      { key: 'EMAIL_PORT', label: 'SMTP Port', type: 'text', placeholder: '587', value: '587' },
      { key: 'EMAIL_USER', label: 'Username', type: 'text', placeholder: 'apikey', value: 'apikey' },
      { key: 'EMAIL_PASS', label: 'Password / API Key', type: 'password', placeholder: 'SG.xxx...', value: '', hint: 'SendGrid API key or SMTP password' },
      { key: 'EMAIL_FROM', label: 'From Address', type: 'text', placeholder: 'hello@mainecleaning.company', value: 'hello@mainecleaning.company' },
    ],
  },
  {
    id: 'intake-webhook',
    name: 'Website Intake Webhook',
    description: 'Receive intake form submissions from WW.MaineCleaning.Company directly into the dashboard.',
    icon: '🔗',
    status: 'connected',
    docsUrl: '#',
    features: [
      'Receive new intake requests automatically',
      'Trigger automation workflows on new submissions',
      'Webhook signature verification for security',
      'Instant notifications when new leads arrive',
    ],
    fields: [
      {
        key: 'WEBHOOK_URL',
        label: 'Webhook URL (configure on your website)',
        type: 'text',
        value: 'https://admin.mainecleaning.company/api/intake',
        hint: 'POST this URL from your website contact form',
      },
      {
        key: 'INTAKE_WEBHOOK_SECRET',
        label: 'Webhook Secret',
        type: 'password',
        placeholder: 'random-secret',
        value: 'configured',
        hint: 'Used to verify requests come from your website',
      },
    ],
  },
];

const statusConfig: Record<IntegrationStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  connected: { label: 'Connected', icon: CheckCircle, className: 'text-emerald-600' },
  disconnected: { label: 'Not configured', icon: AlertCircle, className: 'text-amber-600' },
  partial: { label: 'Partially configured', icon: AlertCircle, className: 'text-orange-500' },
};

export default function IntegrationsPage() {
  const [expanded, setExpanded] = useState<string | null>('square');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));
  const toggleSecret = (key: string) =>
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Integrations</h2>
        <p className="text-sm text-gray-500 mt-1">
          Connect your tools to automate your cleaning business workflow. Configure credentials in{' '}
          <code className="bg-gray-100 px-1 rounded text-xs">.env</code> or directly below.
        </p>
      </div>

      {/* Status overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {integrations.map((integration) => {
          const sc = statusConfig[integration.status];
          const StatusIcon = sc.icon;
          return (
            <button
              key={integration.id}
              onClick={() => toggle(integration.id)}
              className={`flex items-center gap-3 p-3 bg-white rounded-xl border transition-all hover:shadow-sm text-left ${
                expanded === integration.id ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200'
              }`}
            >
              <span className="text-2xl">{integration.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{integration.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <StatusIcon className={`w-3 h-3 ${sc.className}`} />
                  <span className={`text-xs ${sc.className}`}>{sc.label}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Integration detail cards */}
      <div className="space-y-3">
        {integrations.map((integration) => {
          const sc = statusConfig[integration.status];
          const StatusIcon = sc.icon;
          const isOpen = expanded === integration.id;

          return (
            <div key={integration.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Header */}
              <button
                onClick={() => toggle(integration.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{integration.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <StatusIcon className={`w-4 h-4 ${sc.className}`} />
                    <span className={`text-sm font-medium ${sc.className}`}>{sc.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                    {/* Features */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Features</h3>
                      <ul className="space-y-1.5">
                        {integration.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {integration.docsUrl !== '#' && (
                        <a
                          href={integration.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-3"
                        >
                          View Documentation <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Configuration */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Configuration</h3>
                      <div className="space-y-3">
                        {integration.fields.map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              {field.label}
                            </label>
                            <div className="relative">
                              {field.type === 'select' ? (
                                <select
                                  defaultValue={field.value}
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                  {field.options?.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type={
                                    field.type === 'password' && !showSecrets[field.key]
                                      ? 'password'
                                      : 'text'
                                  }
                                  defaultValue={field.value}
                                  placeholder={field.placeholder}
                                  readOnly={field.key === 'WEBHOOK_URL'}
                                  className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                                    field.key === 'WEBHOOK_URL'
                                      ? 'bg-gray-50 font-mono text-xs'
                                      : ''
                                  }`}
                                />
                              )}
                              {field.type === 'password' && (
                                <button
                                  onClick={() => toggleSecret(field.key)}
                                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showSecrets[field.key] ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                            {field.hint && (
                              <p className="text-xs text-gray-400 mt-0.5">{field.hint}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => alert(`${integration.name} settings saved! Restart the server to apply.`)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Changes
                        </button>
                        {integration.status !== 'connected' && (
                          <button
                            onClick={() => alert(`Testing ${integration.name} connection...`)}
                            className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50"
                          >
                            Test Connection
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Environment file tip */}
      <div className="bg-slate-900 rounded-xl p-5 text-sm">
        <p className="text-slate-300 font-semibold mb-2">💡 Pro tip: Use a .env file</p>
        <p className="text-slate-400 mb-3">Copy <code className="text-emerald-400">.env.example</code> to <code className="text-emerald-400">.env</code> and fill in your credentials:</p>
        <pre className="text-emerald-400 text-xs font-mono">
{`cp .env.example .env
# Edit .env with your credentials, then restart`}
        </pre>
      </div>
    </div>
  );
}
