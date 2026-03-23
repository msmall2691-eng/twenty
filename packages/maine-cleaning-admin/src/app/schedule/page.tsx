'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  X,
} from 'lucide-react';
import { formatDate, formatDateTime } from '@/lib/utils';

type JobStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

type Job = {
  id: string;
  title: string;
  client: string;
  address: string;
  date: Date;
  startTime: string;
  duration: number;
  serviceType: string;
  status: JobStatus;
  assignedTo: string[];
  notes: string;
  googleEventId: string | null;
  connectTeamShiftId: string | null;
};

const statusConfig: Record<JobStatus, { label: string; bg: string; border: string; text: string }> = {
  SCHEDULED: { label: 'Scheduled', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-500' },
};

const today = new Date();

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const sampleJobs: Job[] = [
  {
    id: '1',
    title: 'Standard Clean',
    client: 'Sarah Johnson',
    address: '42 Pine Street, Portland',
    date: today,
    startTime: '09:00',
    duration: 120,
    serviceType: 'Standard Clean',
    status: 'SCHEDULED',
    assignedTo: ['Maria G.', 'Tom W.'],
    notes: 'Has a cat. Key under mat.',
    googleEventId: 'evt_abc123',
    connectTeamShiftId: 'shift_001',
  },
  {
    id: '2',
    title: 'Deep Clean',
    client: 'Michael Chen',
    address: '15 Harbor View Dr, Kennebunkport',
    date: today,
    startTime: '13:00',
    duration: 180,
    serviceType: 'Deep Clean',
    status: 'SCHEDULED',
    assignedTo: ['Maria G.', 'Lisa M.'],
    notes: '',
    googleEventId: null,
    connectTeamShiftId: null,
  },
  {
    id: '3',
    title: 'Standard Clean',
    client: 'Patricia Moore',
    address: '77 Ocean Avenue, Ogunquit',
    date: addDays(today, 1),
    startTime: '10:00',
    duration: 120,
    serviceType: 'Standard Clean',
    status: 'SCHEDULED',
    assignedTo: ['Tom W.'],
    notes: 'Alarm code: 1234',
    googleEventId: 'evt_def456',
    connectTeamShiftId: 'shift_002',
  },
  {
    id: '4',
    title: 'Move-Out Clean',
    client: 'Marcus Lee',
    address: '9 Birch Street, Bangor',
    date: addDays(today, 2),
    startTime: '08:00',
    duration: 240,
    serviceType: 'Move-Out Clean',
    status: 'SCHEDULED',
    assignedTo: ['Maria G.', 'Lisa M.', 'Tom W.'],
    notes: 'Large job - budget full day.',
    googleEventId: null,
    connectTeamShiftId: null,
  },
  {
    id: '5',
    title: 'Standard Clean',
    client: 'Amanda Torres',
    address: '56 Elm Street, Brunswick',
    date: addDays(today, -1),
    startTime: '11:00',
    duration: 120,
    serviceType: 'Standard Clean',
    status: 'COMPLETED',
    assignedTo: ['Lisa M.'],
    notes: '',
    googleEventId: 'evt_ghi789',
    connectTeamShiftId: 'shift_003',
  },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7am to 6pm

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<'week' | 'list'>('week');
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - d.getDay()); // Start on Sunday
    return d;
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const prevWeek = () => setWeekStart((d) => addDays(d, -7));
  const nextWeek = () => setWeekStart((d) => addDays(d, 7));

  const jobsThisWeek = sampleJobs.filter((job) => {
    const jobDate = job.date;
    return jobDate >= weekStart && jobDate <= addDays(weekStart, 6);
  });

  const getJobsForDay = (date: Date) =>
    sampleJobs.filter(
      (j) =>
        j.date.getFullYear() === date.getFullYear() &&
        j.date.getMonth() === date.getMonth() &&
        j.date.getDate() === date.getDate(),
    );

  const isToday = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevWeek}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-900">
            {formatDate(weekStart)} – {formatDate(addDays(weekStart, 6))}
          </span>
          <button
            onClick={nextWeek}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setWeekStart(() => {
              const d = new Date(today);
              d.setDate(d.getDate() - d.getDay());
              return d;
            })}
            className="px-3 py-1.5 text-sm font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Integration sync buttons */}
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            📆 Sync Google Cal
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
            👥 Push to ConnectTeam
          </button>
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs rounded-md font-medium ${
                viewMode === 'week' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs rounded-md font-medium ${
                viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Schedule Job
          </button>
        </div>
      </div>

      {viewMode === 'week' ? (
        /* Week grid */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            <div className="px-3 py-3 text-xs text-gray-400 border-r border-gray-100" />
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`px-2 py-3 text-center border-r border-gray-100 last:border-r-0 ${
                  isToday(day) ? 'bg-blue-50' : ''
                }`}
              >
                <p className="text-xs text-gray-500">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p
                  className={`text-sm font-semibold mt-0.5 ${
                    isToday(day)
                      ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto'
                      : 'text-gray-900'
                  }`}
                >
                  {day.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="grid grid-cols-8 min-h-96 max-h-[600px] overflow-y-auto">
            {/* Hour labels */}
            <div className="border-r border-gray-100">
              {HOURS.map((h) => (
                <div key={h} className="h-16 px-2 border-b border-gray-50 flex items-start pt-1">
                  <span className="text-xs text-gray-400">
                    {h <= 12 ? h : h - 12}{h < 12 ? 'am' : 'pm'}
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const dayJobs = getJobsForDay(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-gray-100 last:border-r-0 relative ${
                    isToday(day) ? 'bg-blue-50/30' : ''
                  }`}
                >
                  {HOURS.map((h) => (
                    <div key={h} className="h-16 border-b border-gray-50" />
                  ))}
                  {/* Job blocks */}
                  {dayJobs.map((job) => {
                    const [startH, startM] = job.startTime.split(':').map(Number);
                    const topOffset = ((startH - 7) * 64) + (startM / 60) * 64;
                    const height = (job.duration / 60) * 64;
                    const sc = statusConfig[job.status];
                    return (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className={`absolute left-0.5 right-0.5 ${sc.bg} ${sc.border} border rounded-lg px-1.5 py-1 text-left overflow-hidden hover:shadow-sm transition-shadow`}
                        style={{ top: topOffset, height }}
                      >
                        <p className={`text-xs font-semibold ${sc.text} truncate`}>{job.client}</p>
                        <p className="text-xs text-gray-500 truncate">{job.startTime} · {job.serviceType}</p>
                        {job.assignedTo.length > 0 && (
                          <p className="text-xs text-gray-400 truncate">{job.assignedTo.join(', ')}</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date & Time</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Service</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Crew</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sampleJobs
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((job) => {
                  const sc = statusConfig[job.status];
                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedJob(job)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{formatDate(job.date)}</p>
                            <p className="text-xs text-gray-500">
                              {job.startTime} · {job.duration}min
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{job.client}</p>
                        <p className="text-xs text-gray-500 hidden sm:block">{job.address}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-gray-600">{job.serviceType}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600 text-xs">
                        {job.assignedTo.join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.text}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <div className="flex gap-1.5">
                          {job.googleEventId ? (
                            <span className="text-xs text-emerald-600">📆 ✓</span>
                          ) : (
                            <span className="text-xs text-gray-400">📆 –</span>
                          )}
                          {job.connectTeamShiftId ? (
                            <span className="text-xs text-emerald-600">👥 ✓</span>
                          ) : (
                            <span className="text-xs text-gray-400">👥 –</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Job detail panel */}
      {selectedJob && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-40">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Job Details</h2>
            <button onClick={() => setSelectedJob(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[selectedJob.status].bg} ${statusConfig[selectedJob.status].text}`}>
                {statusConfig[selectedJob.status].label}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-2">{selectedJob.title}</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-gray-400" />
                {selectedJob.client}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-gray-400" />
                {selectedJob.address}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                {formatDate(selectedJob.date)}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-gray-400" />
                {selectedJob.startTime} · {selectedJob.duration} minutes
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Assigned Crew</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.assignedTo.length > 0 ? (
                  selectedJob.assignedTo.map((name) => (
                    <span key={name} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400">No crew assigned</span>
                )}
              </div>
            </div>

            {selectedJob.notes && (
              <div className="bg-amber-50 rounded-lg p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{selectedJob.notes}</p>
              </div>
            )}

            {/* Sync status */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500">Integration Sync</p>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <span>📆</span>
                  <span className="text-sm text-gray-700">Google Calendar</span>
                </div>
                {selectedJob.googleEventId ? (
                  <span className="text-xs text-emerald-600 font-medium">Synced ✓</span>
                ) : (
                  <button className="text-xs text-blue-600 font-medium hover:underline">Sync now</button>
                )}
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span className="text-sm text-gray-700">ConnectTeam</span>
                </div>
                {selectedJob.connectTeamShiftId ? (
                  <span className="text-xs text-emerald-600 font-medium">Pushed ✓</span>
                ) : (
                  <button className="text-xs text-blue-600 font-medium hover:underline">Push shift</button>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {(['IN_PROGRESS', 'COMPLETED'] as JobStatus[]).map((s) => (
                <button
                  key={s}
                  className={`py-2 text-sm font-medium rounded-lg ${
                    selectedJob.status === s
                      ? `${statusConfig[s].bg} ${statusConfig[s].text} border ${statusConfig[s].border}`
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
            <button className="w-full py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Edit Job
            </button>
          </div>
        </div>
      )}

      {/* New job modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Schedule New Job</h2>
              <button onClick={() => setShowNewModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select client...</option>
                  <option>Sarah Johnson</option>
                  <option>Michael Chen</option>
                  <option>Patricia Moore</option>
                  <option>David Williams</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input type="time" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option>Standard Clean</option>
                  <option>Deep Clean</option>
                  <option>Move In/Out</option>
                  <option>Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input type="number" defaultValue={120} min={30} step={30} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                  Sync to Google Calendar
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                  Push to ConnectTeam
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNewModal(false)} className="flex-1 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Job scheduled! (Connect to /api/schedule in production)');
                  setShowNewModal(false);
                }}
                className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Schedule Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
