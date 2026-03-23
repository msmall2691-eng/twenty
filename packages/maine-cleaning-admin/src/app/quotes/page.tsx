'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Send,
  Mail,
  Phone,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

type Quote = {
  id: string;
  quoteNumber: string;
  createdAt: Date;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceType: string;
  total: number;
  status: QuoteStatus;
  sentVia: string | null;
  sentAt: Date | null;
  validUntil: Date | null;
};

const sampleQuotes: Quote[] = [
  {
    id: '1',
    quoteNumber: 'Q-2024-001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah.johnson@example.com',
    clientPhone: '(207) 555-0201',
    serviceType: 'Standard Clean (bi-weekly)',
    total: 120,
    status: 'ACCEPTED',
    sentVia: 'email',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28),
  },
  {
    id: '2',
    quoteNumber: 'Q-2024-002',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    clientName: 'Emily Watson',
    clientEmail: 'emily.watson@example.com',
    clientPhone: '(207) 555-0123',
    serviceType: 'Deep Clean (one-time)',
    total: 280,
    status: 'SENT',
    sentVia: 'both',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: '3',
    quoteNumber: 'Q-2024-003',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    clientName: 'Robert Thompson',
    clientEmail: 'r.thompson@example.com',
    clientPhone: '(207) 555-0987',
    serviceType: 'Standard Clean (bi-weekly)',
    total: 145,
    status: 'DRAFT',
    sentVia: null,
    sentAt: null,
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  },
  {
    id: '4',
    quoteNumber: 'Q-2024-004',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    clientName: 'Jennifer Park',
    clientEmail: 'j.park@example.com',
    clientPhone: '(207) 555-0456',
    serviceType: 'Commercial Clean (weekly)',
    total: 650,
    status: 'VIEWED',
    sentVia: 'email',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25),
  },
  {
    id: '5',
    quoteNumber: 'Q-2024-005',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    clientName: 'Marcus Lee',
    clientEmail: 'marcus.lee@example.com',
    clientPhone: '(207) 555-0765',
    serviceType: 'Move-Out Clean',
    total: 195,
    status: 'REJECTED',
    sentVia: 'sms',
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    validUntil: null,
  },
];

const statusConfig: Record<QuoteStatus, { label: string; className: string; icon: React.ReactNode }> = {
  DRAFT: { label: 'Draft', className: 'bg-gray-100 text-gray-600', icon: <FileText className="w-3 h-3" /> },
  SENT: { label: 'Sent', className: 'bg-blue-100 text-blue-700', icon: <Send className="w-3 h-3" /> },
  VIEWED: { label: 'Viewed', className: 'bg-amber-100 text-amber-700', icon: <Eye className="w-3 h-3" /> },
  ACCEPTED: { label: 'Accepted', className: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700', icon: <XCircle className="w-3 h-3" /> },
  EXPIRED: { label: 'Expired', className: 'bg-orange-100 text-orange-700', icon: <AlertTriangle className="w-3 h-3" /> },
};

export default function QuotesPage() {
  const [quotes] = useState<Quote[]>(sampleQuotes);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<QuoteStatus | 'ALL'>('ALL');
  const [tab, setTab] = useState<'quotes' | 'invoices'>('quotes');

  const filtered = quotes.filter((q) => {
    const matchesSearch = q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAccepted = quotes.filter((q) => q.status === 'ACCEPTED').reduce((s, q) => s + q.total, 0);
  const totalPending = quotes.filter((q) => ['SENT', 'VIEWED'].includes(q.status)).reduce((s, q) => s + q.total, 0);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('quotes')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'quotes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Quotes
        </button>
        <button
          onClick={() => setTab('invoices')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
            tab === 'invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Invoices
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Quotes', value: quotes.length, color: 'text-gray-900' },
          { label: 'Pending Value', value: formatCurrency(totalPending), color: 'text-amber-600' },
          { label: 'Accepted Value', value: formatCurrency(totalAccepted), color: 'text-emerald-600' },
          { label: 'Acceptance Rate', value: `${Math.round((quotes.filter((q) => q.status === 'ACCEPTED').length / quotes.length) * 100)}%`, color: 'text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search quotes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1">
          {(['ALL', 'DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s === 'ALL' ? 'All' : s}
            </button>
          ))}
        </div>
        <Link
          href="/quotes/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors ml-auto"
        >
          <Plus className="w-4 h-4" />
          New Quote
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Quote #</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Service</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Created</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((quote) => {
              const sc = statusConfig[quote.status];
              return (
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-medium text-gray-900">{quote.quoteNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{quote.clientName}</p>
                    <p className="text-xs text-gray-500">{quote.clientEmail}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{quote.serviceType}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                    {formatDate(quote.createdAt)}
                    {quote.validUntil && (
                      <p className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        Valid until {formatDate(quote.validUntil)}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {formatCurrency(quote.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${sc.className}`}>
                      {sc.icon}
                      {sc.label}
                    </span>
                    {quote.sentVia && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        via {quote.sentVia}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {quote.status === 'DRAFT' && (
                        <>
                          <button
                            className="p-1.5 text-blue-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                            title="Send email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            className="p-1.5 text-green-400 hover:text-green-600 rounded-lg hover:bg-green-50"
                            title="Send SMS"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mb-3" />
            <p className="text-sm">No quotes found</p>
          </div>
        )}
      </div>
    </div>
  );
}
