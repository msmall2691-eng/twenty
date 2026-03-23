'use client';

import { useState } from 'react';
import { Plus, Trash2, Send, Mail, Phone, Save, ChevronLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

const servicePresets = [
  { label: 'Standard Clean (1BR/1BA)', price: 80 },
  { label: 'Standard Clean (2BR/2BA)', price: 110 },
  { label: 'Standard Clean (3BR/2BA)', price: 135 },
  { label: 'Standard Clean (4BR/3BA)', price: 165 },
  { label: 'Deep Clean (1BR/1BA)', price: 150 },
  { label: 'Deep Clean (2BR/2BA)', price: 195 },
  { label: 'Deep Clean (3BR/2BA)', price: 245 },
  { label: 'Deep Clean (4BR/3BA)', price: 295 },
  { label: 'Move In/Out Clean', price: 200 },
  { label: 'Commercial Clean (per hour)', price: 55 },
  { label: 'Post-Construction Clean', price: 350 },
  { label: 'Add-on: Inside oven', price: 35 },
  { label: 'Add-on: Inside fridge', price: 25 },
  { label: 'Add-on: Inside windows', price: 45 },
  { label: 'Add-on: Laundry (per load)', price: 20 },
];

export default function NewQuotePage() {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [sendModal, setSendModal] = useState<null | 'email' | 'sms' | 'both'>(null);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addPreset = (preset: { label: string; price: number }) => {
    setLineItems((prev) => [
      ...prev,
      { id: Date.now().toString(), description: preset.label, quantity: 1, unitPrice: preset.price },
    ]);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = discount;
  const taxAmount = ((subtotal - discountAmount) * taxRate) / 100;
  const total = subtotal - discountAmount + taxAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Back */}
      <Link href="/quotes" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ChevronLeft className="w-4 h-4" /> Back to Quotes
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main quote form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">New Quote</h2>
                <p className="text-sm text-gray-500 font-mono">Q-2024-006</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>The Maine Cleaning Company</p>
                <p>(207) 555-0100</p>
                <p>hello@mainecleaning.company</p>
              </div>
            </div>

            {/* Client info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Client Name *</label>
                <input
                  type="text"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Full name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
                <input
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo((p) => ({ ...p, email: e.target.value }))}
                  placeholder="client@email.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="(207) 555-0000"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Service Address</label>
                <input
                  type="text"
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo((p) => ({ ...p, address: e.target.value }))}
                  placeholder="123 Main St, Portland, ME 04101"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="font-medium text-gray-900 mb-4">Services</h3>

            <div className="space-y-2 mb-4">
              {lineItems.map((item, idx) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-6">
                    {idx === 0 && (
                      <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                    )}
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Service description"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && (
                      <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                    )}
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    {idx === 0 && (
                      <label className="block text-xs font-medium text-gray-500 mb-1">Unit $</label>
                    )}
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1 flex items-end">
                    {idx === 0 && <div className="mb-1 h-4" />}
                    <div className="py-2 text-sm font-medium text-gray-900 w-full text-right">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </div>
                  </div>
                  <div className="col-span-1 flex items-end">
                    {idx === 0 && <div className="mb-1 h-4" />}
                    <button
                      onClick={() => removeLineItem(item.id)}
                      disabled={lineItems.length === 1}
                      className="py-2 px-1.5 text-gray-300 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addLineItem}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add line item
            </button>

            {/* Totals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Discount</span>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-0.5 text-xs border border-gray-200 rounded"
                    min="0"
                  />
                </div>
                <span className="font-medium text-red-500">-{formatCurrency(discountAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Tax (%)</span>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-0.5 text-xs border border-gray-200 rounded"
                    min="0"
                    max="100"
                  />
                </div>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes / Terms</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment due upon completion. We accept cash, check, and all major credit cards."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
            <h3 className="font-medium text-gray-900 text-sm mb-3">Send Quote</h3>
            <button
              onClick={() => setSendModal('email')}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              <Mail className="w-4 h-4" />
              Send via Email
            </button>
            <button
              onClick={() => setSendModal('sms')}
              className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              <Phone className="w-4 h-4" />
              Send via SMS
            </button>
            <button
              onClick={() => setSendModal('both')}
              className="flex items-center justify-center gap-2 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              Send via Email + SMS
            </button>
            <button className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-200 text-gray-500 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
          </div>

          {/* Quick presets */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="font-medium text-gray-900 text-sm mb-3">Quick Add Services</h3>
            <div className="space-y-1">
              {servicePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => addPreset(preset)}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-blue-50 hover:text-blue-700 text-gray-600 flex items-center justify-between group transition-colors"
                >
                  <span>{preset.label}</span>
                  <span className="text-gray-400 group-hover:text-blue-600 font-medium">
                    {formatCurrency(preset.price)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Square sync */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800 mb-1">◼ Square Integration</p>
            <p className="text-xs text-amber-700">
              Connect Square in Integrations to automatically create this quote as a Square estimate.
            </p>
            <Link
              href="/integrations"
              className="text-xs font-medium text-amber-700 underline mt-2 block"
            >
              Set up Square →
            </Link>
          </div>
        </div>
      </div>

      {/* Send modal */}
      {sendModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Send Quote {sendModal === 'both' ? 'via Email & SMS' : `via ${sendModal.toUpperCase()}`}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              This will send quote <strong>Q-2024-006</strong> ({formatCurrency(total)}) to{' '}
              <strong>{clientInfo.name || 'the client'}</strong>.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 space-y-1 mb-4">
              {(sendModal === 'email' || sendModal === 'both') && (
                <p>📧 <strong>Email:</strong> {clientInfo.email || 'Not set'}</p>
              )}
              {(sendModal === 'sms' || sendModal === 'both') && (
                <p>📱 <strong>SMS:</strong> {clientInfo.phone || 'Not set'}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSendModal(null)}
                className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Quote sent via ${sendModal}! (Configure email/SMS credentials in .env)`);
                  setSendModal(null);
                }}
                className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
