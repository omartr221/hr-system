import React, { useEffect, useState } from 'react';
import { Plus, Copy, Check, Pencil, Trash2, ToggleLeft, ToggleRight, ExternalLink, X } from 'lucide-react';
import api from '../api/client';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  is_active: number;
  created_at: string;
}

const empty = { title: '', description: '', requirements: '', salary_min: '', salary_max: '', currency: 'USD' };

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Job | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = () =>
    api.get('/jobs?all=true').then((r) => setJobs(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (job: Job) => {
    setEditing(job);
    setForm({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      salary_min: job.salary_min?.toString() ?? '',
      salary_max: job.salary_max?.toString() ?? '',
      currency: job.currency,
    });
    setShowModal(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
      };
      if (editing) {
        await api.put(`/jobs/${editing.id}`, payload);
      } else {
        await api.post('/jobs', payload);
      }
      setShowModal(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (job: Job) => {
    await api.put(`/jobs/${job.id}`, { ...job, is_active: job.is_active ? 0 : 1 });
    load();
  };

  const deleteJob = async (id: number) => {
    await api.delete(`/jobs/${id}`);
    setDeleteId(null);
    load();
  };

  const copyLink = (id: number) => {
    const link = `${window.location.origin}/apply/${id}`;
    navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatSalary = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return null;
    if (job.salary_min && job.salary_max)
      return `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.currency}`;
    if (job.salary_min) return `From ${job.salary_min.toLocaleString()} ${job.currency}`;
    return `Up to ${job.salary_max!.toLocaleString()} ${job.currency}`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Jobs</h1>
          <p className="text-gray-400 mt-1">Manage your open positions</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">No jobs yet. Add your first position!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-white text-lg">{job.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/30 text-gray-400'}`}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {formatSalary(job) && (
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        {formatSalary(job)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{job.description}</p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">Apply link:</span>
                    <code className="text-xs text-blue-300 bg-gray-800 px-2 py-1 rounded">
                      {window.location.origin}/apply/{job.id}
                    </code>
                    <button
                      onClick={() => copyLink(job.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      {copied === job.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copied === job.id ? 'Copied!' : 'Copy'}
                    </button>
                    <a
                      href={`/apply/${job.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Preview
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(job)} className="p-2 text-gray-400 hover:text-white transition-colors" title="Toggle active">
                    {job.is_active ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openEdit(job)} className="p-2 text-gray-400 hover:text-blue-400 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteId(job.id)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="font-semibold text-white">{editing ? 'Edit Job' : 'Add New Job'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Job Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="What is this role about..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Requirements *</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Required skills, experience, education..."
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min Salary</label>
                  <input
                    type="number"
                    value={form.salary_min}
                    onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Salary</label>
                  <input
                    type="number"
                    value={form.salary_max}
                    onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>SAR</option>
                    <option>AED</option>
                    <option>JOD</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-white mb-2">Delete Job?</h3>
            <p className="text-gray-400 text-sm mb-5">This will also delete all applications for this job. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
                Cancel
              </button>
              <button onClick={() => deleteJob(deleteId)} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
