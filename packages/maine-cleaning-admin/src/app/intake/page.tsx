'use client';

import { useState } from 'react';
import {
  ClipboardList,
  Eye,
  Send,
  UserPlus,
  X,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

type IntakeStatus = 'NEW' | 'REVIEWING' | 'QUOTED' | 'SCHEDULED' | 'CLOSED';

type IntakeRequest = {
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
  serviceType: string;
  frequency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  preferredDate: Date | null;
  notes: string;
  status: IntakeStatus;
};

// Sample data – in production these come from /api/intake
const sampleIntake: IntakeRequest[] = [
  {
    id: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
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
    preferredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    notes: 'Moving in next month, need deep clean before furniture arrives.',
    status: 'NEW',
  },
  {
    id: '2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
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
    preferredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    notes: 'Looking for regular bi-weekly cleaning. Have two dogs.',
    status: 'REVIEWING',
  },
  {
    id: '3',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
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
    bedrooms: null,
    bathrooms: null,
    sqft: 3200,
    preferredDate: null,
    notes: 'Small office building, needs weekly cleaning Mon-Fri mornings.',
    status: 'QUOTED',
  },
  {
    id: '4',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    firstName: 'Marcus',
    lastName: 'Lee',
    email: 'marcus.lee@example.com',
    phone: '(207) 555-0765',
    address: '9 Birch Street',
    city: 'Bangor',
    state: 'ME',
    zip: '04401',
    serviceType: 'move-in-out',
    frequency: 'one-time',
    bedrooms: 2,
    bathrooms: 1,
    sqft: 1100,
    preferredDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    notes: 'Moving out end of month.',
    status: 'SCHEDULED',
  },
];

const statusConfig: Record<IntakeStatus, { label: string; className: string }> = {
  NEW: { label: 'New', className: 'bg-blue-100 text-blue-700' },
  REVIEWING: { label: 'Reviewing', className: 'bg-amber-100 text-amber-700' },
  QUOTED: { label: 'Quoted', className: 'bg-purple-100 text-purple-700' },
  SCHEDULED: { label: 'Scheduled', className: 'bg-emerald-100 text-emerald-700' },
  CLOSED: { label: 'Closed', className: 'bg-gray-100 text-gray-500' },
};

const serviceLabels: Record<string, string> = {
  standard: 'Standard Clean',
  deep: 'Deep Clean',
  'move-in-out': 'Move In/Out',
  commercial: 'Commercial',
  'post-construction': 'Post Construction',
};

export default function IntakePage() {
  const [requests, setRequests] = useState<IntakeRequest[]>(sampleIntake);
  const [selected, setSelected] = useState<IntakeRequest | null>(null);
  const [filter, setFilter] = useState<IntakeStatus | 'ALL'>('ALL');
  const [sendModal, setSendModal] = useState<{ request: IntakeRequest; type: 'email' | 'sms' } | null>(null);

  const filtered = filter === 'ALL' ? requests : requests.filter((r) => r.status === filter);

  const updateStatus = (id: string, status: IntakeStatus) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(['ALL', 'NEW', 'REVIEWING', 'QUOTED', 'SCHEDULED', 'CLOSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                filter === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'All' : statusConfig[s].label}
              {s === 'NEW' && (
                <span className="ml-1.5 bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5 rounded-full">
                  {requests.filter((r) => r.status === 'NEW').length}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Intake webhook:{' '}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
            POST /api/intake
          </code>
        </p>
      </div>

      <div className="flex gap-4">
        {/* Table */}
        <div className={`flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${selected ? 'hidden lg:block' : ''}`}>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Service</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Received</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((req) => (
                <tr
                  key={req.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    selected?.id === req.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelected(req)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {req.firstName} {req.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{req.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-800">{serviceLabels[req.serviceType] ?? req.serviceType}</p>
                    <p className="text-xs text-gray-500 capitalize">{req.frequency}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                    {req.city}, {req.state}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                    {formatDateTime(req.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[req.status].className}`}>
                      {statusConfig[req.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(req); }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ClipboardList className="w-10 h-10 mb-3" />
              <p className="text-sm">No intake requests found</p>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full lg:w-96 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                {selected.firstName} {selected.lastName}
              </h2>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Contact */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <a href={`mailto:${selected.email}`} className="text-blue-600 hover:underline">
                      {selected.email}
                    </a>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selected.phone}
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>
                      {selected.address}<br />
                      {selected.city}, {selected.state} {selected.zip}
                    </span>
                  </div>
                </div>
              </section>

              {/* Service details */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Service Details</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Service Type</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">
                      {serviceLabels[selected.serviceType] ?? selected.serviceType}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Frequency</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{selected.frequency}</p>
                  </div>
                  {selected.bedrooms && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Bedrooms</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{selected.bedrooms}</p>
                    </div>
                  )}
                  {selected.bathrooms && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Bathrooms</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{selected.bathrooms}</p>
                    </div>
                  )}
                  {selected.sqft && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Sq. Feet</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{selected.sqft.toLocaleString()}</p>
                    </div>
                  )}
                  {selected.preferredDate && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Preferred Date</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">
                        {formatDateTime(selected.preferredDate)}
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Notes */}
              {selected.notes && (
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</h3>
                  <div className="flex gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3">
                    <MessageSquare className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{selected.notes}</p>
                  </div>
                </section>
              )}

              {/* Status update */}
              <section>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(['NEW', 'REVIEWING', 'QUOTED', 'SCHEDULED', 'CLOSED'] as IntakeStatus[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors ${
                        selected.status === s
                          ? `${statusConfig[s].className} border-transparent`
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              <a
                href={`/quotes/new?intakeId=${selected.id}&clientEmail=${selected.email}&clientName=${selected.firstName}+${selected.lastName}`}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Create & Send Quote
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSendModal({ request: selected, type: 'email' })}
                  className="flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <button
                  onClick={() => setSendModal({ request: selected, type: 'sms' })}
                  className="flex items-center justify-center gap-1.5 text-sm font-medium py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  <Phone className="w-3.5 h-3.5" /> SMS
                </button>
              </div>
              <button className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-lg transition-colors">
                <UserPlus className="w-4 h-4" />
                Convert to Client
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Send modal */}
      {sendModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Send {sendModal.type === 'email' ? 'Email' : 'SMS'} to {sendModal.request.firstName}
              </h2>
              <button onClick={() => setSendModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              {sendModal.type === 'email' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="email"
                      defaultValue={sendModal.request.email}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      defaultValue="Thank you for contacting The Maine Cleaning Company"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={6}
                      defaultValue={`Hi ${sendModal.request.firstName},\n\nThank you for reaching out to The Maine Cleaning Company! We've received your request and will follow up within 24 hours with a personalized quote.\n\nBest regards,\nThe Maine Cleaning Company`}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <input
                      type="tel"
                      defaultValue={sendModal.request.phone}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message (160 chars)</label>
                    <textarea
                      rows={4}
                      defaultValue={`Hi ${sendModal.request.firstName}! Thanks for contacting Maine Cleaning Co. We received your request and will send a quote within 24hrs. Questions? Call (207) 555-0100.`}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setSendModal(null)}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`${sendModal.type === 'email' ? 'Email' : 'SMS'} sent! (Configure SMTP/Twilio in .env)`);
                  setSendModal(null);
                }}
                className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send {sendModal.type === 'email' ? 'Email' : 'SMS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
