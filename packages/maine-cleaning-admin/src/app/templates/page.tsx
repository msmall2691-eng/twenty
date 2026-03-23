'use client';

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
  Phone,
  FileText,
  Eye,
  Save,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

type TemplateType =
  | 'QUOTE_EMAIL'
  | 'QUOTE_SMS'
  | 'INVOICE_EMAIL'
  | 'INVOICE_SMS'
  | 'REMINDER_EMAIL'
  | 'REMINDER_SMS'
  | 'FOLLOW_UP_EMAIL'
  | 'WELCOME_EMAIL';

type Template = {
  id: string;
  name: string;
  type: TemplateType;
  subject?: string;
  body: string;
  variables: string[];
  isDefault: boolean;
  updatedAt: Date;
};

const typeConfig: Record<TemplateType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; channel: 'email' | 'sms' }> = {
  QUOTE_EMAIL: { label: 'Quote Email', icon: Mail, color: 'bg-blue-100 text-blue-700', channel: 'email' },
  QUOTE_SMS: { label: 'Quote SMS', icon: Phone, color: 'bg-green-100 text-green-700', channel: 'sms' },
  INVOICE_EMAIL: { label: 'Invoice Email', icon: Mail, color: 'bg-amber-100 text-amber-700', channel: 'email' },
  INVOICE_SMS: { label: 'Invoice SMS', icon: Phone, color: 'bg-orange-100 text-orange-700', channel: 'sms' },
  REMINDER_EMAIL: { label: 'Reminder Email', icon: Mail, color: 'bg-purple-100 text-purple-700', channel: 'email' },
  REMINDER_SMS: { label: 'Reminder SMS', icon: Phone, color: 'bg-indigo-100 text-indigo-700', channel: 'sms' },
  FOLLOW_UP_EMAIL: { label: 'Follow-up Email', icon: Mail, color: 'bg-rose-100 text-rose-700', channel: 'email' },
  WELCOME_EMAIL: { label: 'Welcome Email', icon: Mail, color: 'bg-emerald-100 text-emerald-700', channel: 'email' },
};

const sampleTemplates: Template[] = [
  {
    id: '1',
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
    variables: ['clientName', 'serviceType', 'scheduledDate', 'total', 'notes', 'validUntil'],
    isDefault: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: '2',
    name: 'Quote SMS',
    type: 'QUOTE_SMS',
    body: `Hi {{clientName}}! Your Maine Cleaning Co. quote is ready: ${{total}} for {{serviceType}} on {{scheduledDate}}. Reply YES to confirm or call (207) 555-0100. Valid until {{validUntil}}.`,
    variables: ['clientName', 'serviceType', 'scheduledDate', 'total', 'validUntil'],
    isDefault: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: '3',
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
    variables: ['clientName', 'invoiceNumber', 'serviceDate', 'total', 'dueDate', 'notes', 'paymentLink'],
    isDefault: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: '4',
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
    variables: ['clientName', 'scheduledDate', 'scheduledTime', 'address'],
    isDefault: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: '5',
    name: 'Welcome Email',
    type: 'WELCOME_EMAIL',
    subject: 'Welcome to The Maine Cleaning Company! 🏠✨',
    body: `Hi {{clientName}},

Welcome to The Maine Cleaning Company! We're thrilled to have you as a new client.

Here's what happens next:
1. We'll review your request and send a quote within 24 hours
2. Once you approve, we'll schedule your first cleaning
3. Sit back and enjoy a spotless home!

If you have any questions:
📞 (207) 555-0100
📧 hello@mainecleaning.company

Welcome to the family!
The Maine Cleaning Company Team`,
    variables: ['clientName'],
    isDefault: true,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(sampleTemplates);
  const [selectedType, setSelectedType] = useState<TemplateType | 'ALL'>('ALL');
  const [editing, setEditing] = useState<Template | null>(null);
  const [previewing, setPreviewing] = useState<Template | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered =
    selectedType === 'ALL'
      ? templates
      : templates.filter((t) => t.type === selectedType);

  const previewVariables: Record<string, string> = {
    clientName: 'Sarah Johnson',
    serviceType: 'Standard Clean (bi-weekly)',
    scheduledDate: 'Monday, March 25, 2024',
    scheduledTime: '9:00 AM',
    total: '120.00',
    notes: '',
    validUntil: 'March 31, 2024',
    invoiceNumber: 'INV-2024-001',
    serviceDate: 'March 20, 2024',
    dueDate: 'April 3, 2024',
    paymentLink: 'https://square.link/example',
    address: '42 Pine Street, Portland, ME 04101',
  };

  const interpolate = (text: string) =>
    text.replace(/\{\{(\w+)\}\}/g, (_, key) => previewVariables[key] ?? `[${key}]`);

  return (
    <div className="space-y-4">
      {/* Type filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedType('ALL')}
          className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
            selectedType === 'ALL'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {(Object.entries(typeConfig) as [TemplateType, typeof typeConfig[TemplateType]][]).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                selectedType === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cfg.label}
            </button>
          );
        })}
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          New Template
        </button>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((template) => {
          const tc = typeConfig[template.type];
          const Icon = tc.icon;
          return (
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${tc.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{template.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${tc.color}`}>
                        {tc.label}
                      </span>
                      {template.isDefault && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreviewing(template)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditing(template)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!template.isDefault && (
                    <button
                      onClick={() => setTemplates((prev) => prev.filter((t) => t.id !== template.id))}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {template.subject && (
                <p className="text-xs font-medium text-gray-500 mb-1">Subject: <span className="text-gray-800">{template.subject}</span></p>
              )}

              <div className="bg-gray-50 rounded-lg p-3 mt-2">
                <p className="text-xs text-gray-600 line-clamp-3 whitespace-pre-line font-mono">
                  {template.body}
                </p>
              </div>

              {/* Variables */}
              <div className="flex flex-wrap gap-1 mt-3">
                {template.variables.map((v) => (
                  <code key={v} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                    {'{{'}{v}{'}}'}
                  </code>
                ))}
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Updated {formatDate(template.updatedAt)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-semibold text-gray-900">Edit Template: {editing.name}</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                <input
                  type="text"
                  defaultValue={editing.name}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {editing.subject !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                  <input
                    type="text"
                    defaultValue={editing.subject}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Body</label>
                  <div className="flex gap-1">
                    {editing.variables.map((v) => (
                      <code key={v} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-blue-100">
                        {'{{'}{v}{'}}'}
                      </code>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={14}
                  defaultValue={editing.body}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 sticky bottom-0 bg-white">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => { setEditing(null); alert('Template saved!'); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Save className="w-4 h-4" />
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <div>
                <h2 className="font-semibold text-gray-900">Preview: {previewing.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Shown with sample data</p>
              </div>
              <button onClick={() => setPreviewing(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {previewing.subject && (
                <div className="mb-4 pb-4 border-b border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Subject</p>
                  <p className="text-sm font-medium text-gray-900">{interpolate(previewing.subject)}</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {interpolate(previewing.body)}
                </pre>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
              <button onClick={() => setPreviewing(null)} className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                Close
              </button>
              <button onClick={() => { setPreviewing(null); setEditing(previewing); }} className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Edit Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
