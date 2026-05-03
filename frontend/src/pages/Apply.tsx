import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Building2, Upload, CheckCircle, Loader2, FileText, X } from 'lucide-react';
import axios from 'axios';

interface Job {
  id: number;
  title: string;
  description: string;
  requirements: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  is_active: number;
}

export default function Apply() {
  const { jobId } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/jobs/${jobId}`)
      .then((r) => {
        if (!r.data.is_active) setNotFound(true);
        else setJob(r.data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === 'application/pdf') setFile(dropped);
    else setError('Please upload a PDF file');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please attach your CV (PDF)'); return; }
    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('applicant_name', name);
    if (email) formData.append('applicant_email', email);
    if (phone) formData.append('applicant_phone', phone);
    formData.append('cv', file);

    try {
      await axios.post(`/api/applications/apply/${jobId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as any)?.response?.data?.error ?? 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (job: Job) => {
    if (!job.salary_min && !job.salary_max) return null;
    if (job.salary_min && job.salary_max)
      return `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.currency}`;
    if (job.salary_min) return `From ${job.salary_min.toLocaleString()} ${job.currency}`;
    return `Up to ${job.salary_max!.toLocaleString()} ${job.currency}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Position Not Available</h1>
          <p className="text-gray-400">This job posting is no longer active or does not exist.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Application Submitted!</h1>
          <p className="text-gray-400 mb-1">
            Thank you, <span className="text-white">{name}</span>! Your application for{' '}
            <span className="text-white">{job?.title}</span> has been received.
          </p>
          <p className="text-gray-500 text-sm mt-3">
            Our AI is analyzing your resume. We will review your application and get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-400 text-sm">HR System — Job Application</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-white">{job?.title}</h1>
              {formatSalary(job!) && (
                <span className="inline-block mt-2 text-sm text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                  {formatSalary(job!)}
                </span>
              )}
            </div>
          </div>
          <p className="mt-4 text-gray-300 text-sm leading-relaxed">{job?.description}</p>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Requirements</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{job?.requirements}</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-6">Submit Your Application</h2>

          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                CV / Resume <span className="text-red-400">*</span>
                <span className="text-gray-500 font-normal ml-1">(PDF only, max 10MB)</span>
              </label>

              {file ? (
                <div className="flex items-center gap-3 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <span className="flex-1 text-sm text-white truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('cv-input')?.click()}
                  className={`cursor-pointer border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragging
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                  }`}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">
                    Drag & drop your PDF here, or <span className="text-blue-400">browse</span>
                  </p>
                  <input
                    id="cv-input"
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setFile(f);
                    }}
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
