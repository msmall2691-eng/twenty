'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Eye,
  FileText,
  Calendar,
  X,
  Edit2,
} from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';

type Client = {
  id: string;
  createdAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  totalJobs: number;
  totalSpend: number;
  lastServiceDate: Date | null;
  frequency: string;
};

const sampleClients: Client[] = [
  {
    id: '1',
    createdAt: new Date('2023-03-15'),
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '(207) 555-0201',
    address: '42 Pine Street',
    city: 'Portland',
    state: 'ME',
    zip: '04101',
    notes: 'Prefers morning appointments. Has a cat.',
    totalJobs: 24,
    totalSpend: 2880,
    lastServiceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    frequency: 'bi-weekly',
  },
  {
    id: '2',
    createdAt: new Date('2023-06-20'),
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@example.com',
    phone: '(207) 555-0342',
    address: '15 Harbor View Drive',
    city: 'Kennebunkport',
    state: 'ME',
    zip: '04046',
    notes: 'Vacation home - only available June through September.',
    totalJobs: 12,
    totalSpend: 3600,
    lastServiceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    frequency: 'weekly',
  },
  {
    id: '3',
    createdAt: new Date('2024-01-08'),
    firstName: 'Patricia',
    lastName: 'Moore',
    email: 'p.moore@example.com',
    phone: '(207) 555-0533',
    address: '77 Ocean Avenue',
    city: 'Ogunquit',
    state: 'ME',
    zip: '03907',
    notes: '',
    totalJobs: 8,
    totalSpend: 960,
    lastServiceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    frequency: 'monthly',
  },
  {
    id: '4',
    createdAt: new Date('2024-02-14'),
    firstName: 'David',
    lastName: 'Williams',
    email: 'david.w@example.com',
    phone: '(207) 555-0678',
    address: '201 Main Street',
    city: 'Bangor',
    state: 'ME',
    zip: '04401',
    notes: 'Large home - budget 3 hours.',
    totalJobs: 6,
    totalSpend: 1440,
    lastServiceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    frequency: 'bi-weekly',
  },
  {
    id: '5',
    createdAt: new Date('2024-04-01'),
    firstName: 'Amanda',
    lastName: 'Torres',
    email: 'a.torres@example.com',
    phone: '(207) 555-0912',
    address: '56 Elm Street',
    city: 'Brunswick',
    state: 'ME',
    zip: '04011',
    notes: 'New client. Referred by Sarah Johnson.',
    totalJobs: 2,
    totalSpend: 280,
    lastServiceDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    frequency: 'bi-weekly',
  },
];

const frequencyColors: Record<string, string> = {
  weekly: 'bg-green-100 text-green-700',
  'bi-weekly': 'bg-blue-100 text-blue-700',
  monthly: 'bg-purple-100 text-purple-700',
  'one-time': 'bg-gray-100 text-gray-600',
};

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
];

export default function ClientsPage() {
  const [clients] = useState<Client[]>(sampleClients);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Client | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Clients', value: clients.length },
          { label: 'Weekly Regulars', value: clients.filter((c) => c.frequency === 'weekly').length },
          {
            label: 'Total Revenue',
            value: `$${clients.reduce((s, c) => s + c.totalSpend, 0).toLocaleString()}`,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        {/* Client grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 content-start">
          {filtered.map((client, idx) => (
            <div
              key={client.id}
              onClick={() => setSelected(client)}
              className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer hover:shadow-md transition-all ${
                selected?.id === client.id ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 ${avatarColors[idx % avatarColors.length]} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <span className="text-white text-sm font-bold">
                    {getInitials(client.firstName, client.lastName)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">
                    {client.firstName} {client.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{client.email}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${frequencyColors[client.frequency] ?? 'bg-gray-100 text-gray-600'}`}>
                      {client.frequency}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-semibold text-gray-900">{client.totalJobs}</p>
                  <p className="text-gray-500">Jobs</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">${client.totalSpend.toLocaleString()}</p>
                  <p className="text-gray-500">Revenue</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {client.lastServiceDate ? formatDate(client.lastServiceDate) : 'Never'}
                  </p>
                  <p className="text-gray-500">Last Service</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
              <Users className="w-10 h-10 mb-3" />
              <p className="text-sm">No clients found</p>
            </div>
          )}
        </div>

        {/* Client detail panel */}
        {selected && (
          <div className="w-80 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col flex-shrink-0">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Client Details</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-bold">
                    {getInitials(selected.firstName, selected.lastName)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {selected.firstName} {selected.lastName}
                  </p>
                  <p className="text-sm text-gray-500">Client since {formatDate(selected.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">{selected.email}</a>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {selected.phone}
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span>{selected.address}<br />{selected.city}, {selected.state} {selected.zip}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Jobs', value: selected.totalJobs },
                  { label: 'Revenue', value: `$${selected.totalSpend.toLocaleString()}` },
                  { label: 'Frequency', value: selected.frequency },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-2">
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                ))}
              </div>

              {selected.notes && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{selected.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-2">
              <a
                href={`/quotes/new?clientId=${selected.id}`}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                Create Quote
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`/schedule?clientId=${selected.id}`}
                  className="flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Calendar className="w-3.5 h-3.5" /> Schedule
                </a>
                <button className="flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New client modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Add New Client</h2>
              <button onClick={() => setShowNewForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'First Name', id: 'firstName', type: 'text', required: true },
                { label: 'Last Name', id: 'lastName', type: 'text', required: true },
                { label: 'Email', id: 'email', type: 'email', required: true, colSpan: 2 },
                { label: 'Phone', id: 'phone', type: 'tel' },
                { label: 'City', id: 'city', type: 'text' },
                { label: 'Address', id: 'address', type: 'text', colSpan: 2 },
              ].map((field) => (
                <div key={field.id} className={field.colSpan === 2 ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowNewForm(false)}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Client saved! (Connect to /api/clients in production)');
                  setShowNewForm(false);
                }}
                className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
