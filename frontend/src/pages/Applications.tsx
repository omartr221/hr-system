import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight } from 'lucide-react';
import api from '../api/client';

interface Application {
  id: number;
  applicant_name: string;
  applicant_email: string | null;
  job_title: string;
  status: string;
  ai_score: number | null;
  ai_recommendation: string | null;
  created_at: string;
}

interface Job {
  id: number;
  title: string;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-500 text-xs">—</span>;
  const color =
    score >= 80 ? 'text-green-400 bg-green-400/10 border-green-400/20' :
    score >= 60 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
    score >= 40 ? 'text-orange-400 bg-orange-400/10 border-orange-400/20' :
    'text-red-400 bg-red-400/10 border-red-400/20';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${color}`}>
      {score}/100
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-gray-600/30 text-gray-300 border-gray-600/30',
    evaluating: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
    completed: 'bg-green-500/20 text-green-400 border-green-500/20',
    failed: 'bg-red-500/20 text-red-400 border-red-500/20',
    hired: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${map[status] ?? 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  );
}

export default function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterJob, setFilterJob] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = () => {
    const params = new URLSearchParams();
    if (filterJob) params.set('jobId', filterJob);
    if (filterStatus) params.set('status', filterStatus);
    api.get(`/applications?${params}`).then((r) => setApplications(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    api.get('/jobs?all=true').then((r) => setJobs(r.data));
  }, []);

  useEffect(() => { load(); }, [filterJob, filterStatus]);

  const filtered = applications.filter((a) =>
    !search || a.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
    a.job_title.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Applications</h1>
        <p className="text-gray-400 mt-1">Review and manage all job applications</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or job..."
            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
            className="py-2 px-3 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Jobs</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 bg-gray-900 border border-gray-800 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="evaluating">Evaluating</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400">No applications found</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Applicant</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Job</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">AI Score</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filtered.map((app) => (
                <tr key={app.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {app.applicant_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{app.applicant_name}</p>
                        {app.applicant_email && <p className="text-xs text-gray-400">{app.applicant_email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{app.job_title}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{formatDate(app.created_at)}</td>
                  <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                  <td className="px-6 py-4"><ScoreBadge score={app.ai_score} /></td>
                  <td className="px-6 py-4">
                    <Link to={`/applications/${app.id}`} className="text-gray-400 hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
