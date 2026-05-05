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
    if (job.salary_min) return `من ${job.salary_min.toLocaleString()} ${job.currency}`;
    return `حتى ${job.salary_max!.toLocaleString()} ${job.currency}`;
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">الوظائف</h1>
          <p className="text-gray-400 mt-1">إدارة الوظائف المفتوحة</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> إضافة وظيفة
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">لا توجد وظائف بعد. أضف أول وظيفة!</p>
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
                      {job.is_active ? 'نشطة' : 'غير نشطة'}
                    </span>
                    {formatSalary(job) && (
                      <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                        {formatSalary(job)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-2 line-clamp-2">{job.description}</p>
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-500">رابط التقديم:</span>
                    <code className="text-xs text-blue-300 bg-gray-800 px-2 py-1 rounded">
                      {window.location.origin}/apply/{job.id}
                    </code>
                    <button
                      onClick={() => copyLink(job.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      {copied === job.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copied === job.id ? 'تم النسخ!' : 'نسخ'}
                    </button>
                    <a
                      href={`/apply/${job.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> معاينة
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
              <h2 className="font-semibold text-white">{editing ? 'تعديل الوظيفة' : 'إضافة وظيفة جديدة'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">عنوان الوظيفة *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثل: مطور واجهات أمامية"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">الوصف *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="ما هو هذا الدور..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">المتطلبات *</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="المهارات والخبرة والتعليم المطلوب..."
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">الحد الأدنى</label>
                  <input
                    type="number"
                    value={form.salary_min}
                    onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">الحد الأعلى</label>
                  <input
                    type="number"
                    value={form.salary_max}
                    onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">العملة</label>
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
                  إلغاء
                </button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
                  {saving ? 'جاري الحفظ...' : editing ? 'حفظ التعديلات' : 'إنشاء الوظيفة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-white mb-2">حذف الوظيفة؟</h3>
            <p className="text-gray-400 text-sm mb-5">سيتم حذف جميع الطلبات المرتبطة بهذه الوظيفة. لا يمكن التراجع.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors">
                إلغاء
              </button>
              <button onClick={() => deleteJob(deleteId)} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
