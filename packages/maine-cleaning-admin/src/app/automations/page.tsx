'use client';

import { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  ChevronRight,
  X,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  Users,
  FileText,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

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

type ActionType =
  | 'SEND_EMAIL'
  | 'SEND_SMS'
  | 'CREATE_JOB'
  | 'CREATE_INVOICE'
  | 'SYNC_GOOGLE_CALENDAR'
  | 'SYNC_CONNECT_TEAM'
  | 'UPDATE_STATUS'
  | 'NOTIFY_ADMIN';

type Automation = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: TriggerType;
  actions: { type: ActionType; config?: string }[];
  runCount: number;
  lastRunAt: Date | null;
};

const triggerConfig: Record<TriggerType, { label: string; icon: string; description: string }> = {
  INTAKE_RECEIVED: { label: 'Intake Received', icon: '📥', description: 'When a new form is submitted on your website' },
  QUOTE_ACCEPTED: { label: 'Quote Accepted', icon: '✅', description: 'When a client accepts a quote' },
  QUOTE_EXPIRED: { label: 'Quote Expired', icon: '⏰', description: 'When a quote passes its valid-until date' },
  JOB_SCHEDULED: { label: 'Job Scheduled', icon: '📅', description: 'When a new cleaning job is created' },
  JOB_COMPLETED: { label: 'Job Completed', icon: '🏁', description: 'When a job is marked complete' },
  INVOICE_CREATED: { label: 'Invoice Created', icon: '🧾', description: 'When a new invoice is generated' },
  INVOICE_OVERDUE: { label: 'Invoice Overdue', icon: '💸', description: 'When an invoice passes its due date' },
  CLIENT_CREATED: { label: 'Client Created', icon: '👤', description: 'When a new client is added' },
  MANUAL: { label: 'Manual Trigger', icon: '▶️', description: 'Run manually on demand' },
};

const actionConfig: Record<ActionType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  SEND_EMAIL: { label: 'Send Email', icon: Mail, color: 'text-blue-600' },
  SEND_SMS: { label: 'Send SMS', icon: Phone, color: 'text-green-600' },
  CREATE_JOB: { label: 'Create Job', icon: Calendar, color: 'text-purple-600' },
  CREATE_INVOICE: { label: 'Create Invoice', icon: FileText, color: 'text-amber-600' },
  SYNC_GOOGLE_CALENDAR: { label: 'Sync Google Calendar', icon: Calendar, color: 'text-blue-500' },
  SYNC_CONNECT_TEAM: { label: 'Push to ConnectTeam', icon: Users, color: 'text-indigo-600' },
  UPDATE_STATUS: { label: 'Update Status', icon: CheckCircle, color: 'text-emerald-600' },
  NOTIFY_ADMIN: { label: 'Notify Admin', icon: Zap, color: 'text-orange-500' },
};

const sampleAutomations: Automation[] = [
  {
    id: '1',
    name: 'New Intake → Send Welcome Email',
    description: 'Automatically send a welcome email when a new intake request is received',
    isActive: true,
    trigger: 'INTAKE_RECEIVED',
    actions: [
      { type: 'SEND_EMAIL', config: 'template: WELCOME_EMAIL' },
    ],
    runCount: 47,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '2',
    name: 'Quote Accepted → Schedule & Sync',
    description: 'Create a job and push to Google Calendar and ConnectTeam when a quote is accepted',
    isActive: true,
    trigger: 'QUOTE_ACCEPTED',
    actions: [
      { type: 'CREATE_JOB' },
      { type: 'SYNC_GOOGLE_CALENDAR' },
      { type: 'SYNC_CONNECT_TEAM' },
    ],
    runCount: 23,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: '3',
    name: 'Job Completed → Auto Invoice',
    description: 'Create and send invoice via Square when job is marked complete',
    isActive: true,
    trigger: 'JOB_COMPLETED',
    actions: [
      { type: 'CREATE_INVOICE', config: 'via: Square' },
      { type: 'SEND_EMAIL', config: 'template: INVOICE_EMAIL' },
    ],
    runCount: 31,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: '4',
    name: 'Appointment Reminder (24h)',
    description: 'Send email + SMS reminder 24 hours before a scheduled cleaning',
    isActive: true,
    trigger: 'JOB_SCHEDULED',
    actions: [
      { type: 'SEND_EMAIL', config: 'template: REMINDER_EMAIL, delay: 24h before' },
      { type: 'SEND_SMS', config: 'template: REMINDER_SMS, delay: 24h before' },
    ],
    runCount: 89,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: '5',
    name: 'Quote Expiring → Follow Up',
    description: 'Send follow-up email when a quote is about to expire (3 days before)',
    isActive: false,
    trigger: 'QUOTE_EXPIRED',
    actions: [
      { type: 'SEND_EMAIL', config: 'template: FOLLOW_UP_EMAIL, delay: -3 days' },
    ],
    runCount: 5,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  },
  {
    id: '6',
    name: 'Invoice Overdue → Payment Reminder',
    description: 'Send SMS payment reminder when invoice is 7 days overdue',
    isActive: false,
    trigger: 'INVOICE_OVERDUE',
    actions: [
      { type: 'SEND_SMS', config: 'template: PAYMENT_REMINDER, condition: overdue > 7 days' },
    ],
    runCount: 2,
    lastRunAt: null,
  },
];

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>(sampleAutomations);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | null>(null);
  const [selectedActions, setSelectedActions] = useState<ActionType[]>([]);
  const [newName, setNewName] = useState('');

  const toggleActive = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)),
    );
  };

  const activeCount = automations.filter((a) => a.isActive).length;
  const totalRuns = automations.reduce((s, a) => s + a.runCount, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Automations', value: automations.length },
          { label: 'Active', value: activeCount, color: 'text-emerald-600' },
          { label: 'Total Runs', value: totalRuns.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color ?? 'text-gray-900'}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Automations run automatically based on triggers. No code required.
        </p>
        <button
          onClick={() => setShowBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Automation
        </button>
      </div>

      {/* Automation cards */}
      <div className="space-y-3">
        {automations.map((automation) => {
          const trigger = triggerConfig[automation.trigger];
          return (
            <div
              key={automation.id}
              className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${
                automation.isActive ? 'border-gray-200' : 'border-gray-100 opacity-70'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Toggle */}
                <button
                  onClick={() => toggleActive(automation.id)}
                  className={`mt-0.5 w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${
                    automation.isActive ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      automation.isActive ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{automation.name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{automation.description}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Trigger + Actions flow */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg">
                      <span className="text-sm">{trigger.icon}</span>
                      <span className="text-xs font-medium text-blue-700">{trigger.label}</span>
                    </div>
                    {automation.actions.map((action, idx) => {
                      const ac = actionConfig[action.type];
                      const ActionIcon = ac.icon;
                      return (
                        <div key={idx} className="flex items-center gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg">
                            <ActionIcon className={`w-3.5 h-3.5 ${ac.color}`} />
                            <span className="text-xs font-medium text-gray-700">{ac.label}</span>
                            {action.config && (
                              <span className="text-xs text-gray-400 hidden lg:inline">· {action.config}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      {automation.runCount} runs
                    </span>
                    {automation.lastRunAt && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last run {formatDateTime(automation.lastRunAt)}
                      </span>
                    )}
                    {!automation.isActive && (
                      <span className="text-xs text-amber-600 font-medium">Paused</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Builder modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Create Automation</h2>
              <button onClick={() => { setShowBuilder(false); setSelectedTrigger(null); setSelectedActions([]); }} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Automation Name *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. New Intake → Send Welcome Email"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  1. When this happens (Trigger)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.entries(triggerConfig) as [TriggerType, typeof triggerConfig[TriggerType]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedTrigger(key)}
                      className={`flex items-start gap-2 p-3 rounded-lg border text-left transition-all ${
                        selectedTrigger === key
                          ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-lg flex-shrink-0">{cfg.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{cfg.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{cfg.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  2. Do these actions (select multiple)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.entries(actionConfig) as [ActionType, typeof actionConfig[ActionType]][]).map(([key, cfg]) => {
                    const ActionIcon = cfg.icon;
                    const isSelected = selectedActions.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() =>
                          setSelectedActions((prev) =>
                            isSelected ? prev.filter((a) => a !== key) : [...prev, key],
                          )
                        }
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <ActionIcon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                        <p className="text-xs font-medium text-gray-900">{cfg.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              {selectedTrigger && selectedActions.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Preview</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg">
                      <span>{triggerConfig[selectedTrigger].icon}</span>
                      <span className="text-xs font-medium text-blue-700">{triggerConfig[selectedTrigger].label}</span>
                    </div>
                    {selectedActions.map((a) => {
                      const ac = actionConfig[a];
                      const Icon = ac.icon;
                      return (
                        <div key={a} className="flex items-center gap-1.5">
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-100 rounded-lg">
                            <Icon className={`w-3.5 h-3.5 ${ac.color}`} />
                            <span className="text-xs font-medium text-gray-700">{ac.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => { setShowBuilder(false); setSelectedTrigger(null); setSelectedActions([]); }}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={!selectedTrigger || selectedActions.length === 0 || !newName}
                onClick={() => {
                  alert(`Automation "${newName}" created!`);
                  setShowBuilder(false);
                  setSelectedTrigger(null);
                  setSelectedActions([]);
                  setNewName('');
                }}
                className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Automation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
