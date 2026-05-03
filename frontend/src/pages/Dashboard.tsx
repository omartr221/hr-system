import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Users, Clock, TrendingUp, CheckCircle, UserCheck, ChevronRight,
} from 'lucide-react';
import api from '../api/client';

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingEvaluations: number;
  completedEvaluations: number;
  hiredCount: number;
  avgScore: number | null;
  applicationsByJob: { id: number; title: string; count: number; avg_score: number | null }[];
  recentApplications: {
    id: number;
    applicant_name: string;
    job_title: string;
    status: string;
    ai_score: number | null;
    created_at: string;
  }[];
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-500 text-sm">—</span>;
  const color =
    score >= 80 ? 'text-green-400 bg-green-400/10' :
    score >= 60 ? 'text-yellow-400 bg-yellow-400/10' :
    score >= 40 ? 'text-orange-400 bg-orange-400/10' :
    'text-red-400 bg-red-400/10';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {score}/100
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-gray-600/30 text-gray-300',
    evaluating: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    hired: 'bg-emerald-500/20 text-emerald-400',
    rejected: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${map[status] ?? 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then((r) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Jobs', value: stats.totalJobs, sub: `${stats.activeJobs} active`, icon: Briefcase, color: 'blue' },
    { label: 'Applications', value: stats.totalApplications, sub: 'all time', icon: Users, color: 'purple' },
    { label: 'Pending Review', value: stats.pendingEvaluations, sub: 'awaiting AI', icon: Clock, color: 'yellow' },
    { label: 'Avg AI Score', value: stats.avgScore !== null ? `${stats.avgScore}` : '—', sub: 'out of 100', icon: TrendingUp, color: 'green' },
    { label: 'Evaluated', value: stats.completedEvaluations, sub: 'completed', icon: CheckCircle, color: 'teal' },
    { label: 'Hired', value: stats.hiredCount, sub: 'this pipeline', icon: UserCheck, color: 'emerald' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    purple: 'bg-purple-500/10 text-purple-400',
    yellow: 'bg-yellow-500/10 text-yellow-400',
    green: 'bg-green-500/10 text-green-400',
    teal: 'bg-teal-500/10 text-teal-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Recruitment overview at a glance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">{label}</span>
              <div className={`p-2 rounded-lg ${colorMap[color]}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Applications by Job</h2>
            <Link to="/jobs" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View jobs <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.applicationsByJob.length === 0 ? (
            <p className="text-gray-500 text-sm">No jobs yet</p>
          ) : (
            <div className="space-y-3">
              {stats.applicationsByJob.map((job) => (
                <div key={job.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{job.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div
                        className="h-1.5 bg-blue-600 rounded-full"
                        style={{ width: `${Math.min((job.count / (stats.totalApplications || 1)) * 100 * 2, 100)}%`, minWidth: '8px' }}
                      />
                      <span className="text-xs text-gray-400">{job.count} applicants</span>
                    </div>
                  </div>
                  {job.avg_score !== null && (
                    <ScoreBadge score={Math.round(job.avg_score)} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Applications</h2>
            <Link to="/applications" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recentApplications.length === 0 ? (
            <p className="text-gray-500 text-sm">No applications yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentApplications.map((app) => (
                <Link
                  key={app.id}
                  to={`/applications/${app.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {app.applicant_name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{app.applicant_name}</p>
                    <p className="text-xs text-gray-400 truncate">{app.job_title}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={app.status} />
                    <ScoreBadge score={app.ai_score} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
