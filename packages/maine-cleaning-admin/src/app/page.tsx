import {
  Users,
  ClipboardList,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

// In a real app these would come from the database
const stats = [
  {
    label: 'Active Clients',
    value: '47',
    change: '+3 this month',
    trend: 'up',
    icon: Users,
    color: 'bg-blue-500',
  },
  {
    label: 'Pending Intake',
    value: '12',
    change: '4 need review',
    trend: 'neutral',
    icon: ClipboardList,
    color: 'bg-amber-500',
  },
  {
    label: "This Week's Jobs",
    value: '28',
    change: '3 scheduled today',
    trend: 'up',
    icon: Calendar,
    color: 'bg-emerald-500',
  },
  {
    label: 'Monthly Revenue',
    value: '$18,450',
    change: '+12% vs last month',
    trend: 'up',
    icon: DollarSign,
    color: 'bg-purple-500',
  },
];

const recentIntake = [
  {
    id: '1',
    name: 'Emily Watson',
    service: 'Deep Clean',
    city: 'Bar Harbor',
    time: new Date(Date.now() - 1000 * 60 * 45),
    status: 'NEW',
  },
  {
    id: '2',
    name: 'Robert Thompson',
    service: 'Bi-Weekly Standard',
    city: 'Augusta',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'REVIEWING',
  },
  {
    id: '3',
    name: 'Jennifer Park',
    service: 'Commercial Weekly',
    city: 'Rockland',
    time: new Date(Date.now() - 1000 * 60 * 60 * 5),
    status: 'QUOTED',
  },
];

const upcomingJobs = [
  {
    id: '1',
    client: 'Sarah Johnson',
    address: '42 Pine St, Portland',
    time: 'Today 9:00 AM',
    service: 'Standard Clean',
    status: 'SCHEDULED',
  },
  {
    id: '2',
    client: 'Michael Chen',
    address: '15 Harbor View Dr, Kennebunkport',
    time: 'Today 1:00 PM',
    service: 'Deep Clean',
    status: 'SCHEDULED',
  },
  {
    id: '3',
    client: 'Patricia Moore',
    address: '77 Ocean Ave, Ogunquit',
    time: 'Tomorrow 10:00 AM',
    service: 'Move-Out Clean',
    status: 'SCHEDULED',
  },
  {
    id: '4',
    client: 'David Williams',
    address: '201 Main St, Bangor',
    time: 'Tomorrow 2:00 PM',
    service: 'Standard Clean',
    status: 'CONFIRMED',
  },
];

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  REVIEWING: 'bg-amber-100 text-amber-700',
  QUOTED: 'bg-purple-100 text-purple-700',
  SCHEDULED: 'bg-emerald-100 text-emerald-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-2.5 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Intake Requests */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Intake Requests</h2>
            <a href="/intake" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all →
            </a>
          </div>
          <div className="divide-y divide-gray-50">
            {recentIntake.map((req) => (
              <div key={req.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{req.name}</p>
                    <p className="text-xs text-gray-500">
                      {req.service} · {req.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[req.status]}`}>
                      {req.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(req.time)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 bg-gray-50 rounded-b-xl">
            <a
              href="/quotes/new"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + Create quote from intake
            </a>
          </div>
        </div>

        {/* Upcoming Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Upcoming Jobs</h2>
            <a href="/schedule" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View calendar →
            </a>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingJobs.map((job) => (
              <div key={job.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{job.client}</p>
                      <p className="text-xs text-gray-500">{job.address}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {job.time} · {job.service}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[job.status]}`}>
                    {job.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'New Quote', href: '/quotes/new', icon: '📋', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { label: 'Add Client', href: '/clients/new', icon: '👤', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            { label: 'Schedule Job', href: '/schedule', icon: '📅', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            { label: 'Create Template', href: '/templates', icon: '📄', color: 'bg-purple-50 text-purple-700 border-purple-200' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border text-sm font-medium transition-all hover:shadow-sm ${action.color}`}
            >
              <span className="text-2xl">{action.icon}</span>
              {action.label}
            </a>
          ))}
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Integration Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'Google Calendar', status: 'connected', icon: '📆' },
            { name: 'Square', status: 'disconnected', icon: '◼' },
            { name: 'ConnectTeam', status: 'disconnected', icon: '👥' },
            { name: 'Twilio SMS', status: 'connected', icon: '💬' },
          ].map((integration) => (
            <div
              key={integration.name}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
            >
              <span className="text-xl">{integration.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{integration.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {integration.status === 'connected' ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs text-emerald-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600">Set up needed</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          <a href="/integrations" className="text-blue-600 hover:underline">Configure integrations →</a>
        </p>
      </div>
    </div>
  );
}
