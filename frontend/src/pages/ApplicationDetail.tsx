import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, FileText, CheckCircle, XCircle,
  ThumbsUp, ThumbsDown, RotateCcw, Loader2,
} from 'lucide-react';
import api from '../api/client';

interface Application {
  id: number;
  applicant_name: string;
  applicant_email: string | null;
  applicant_phone: string | null;
  cv_filename: string;
  cv_path: string;
  job_title: string;
  job_requirements: string;
  job_description: string;
  status: string;
  ai_score: number | null;
  ai_strengths: string | null;
  ai_weaknesses: string | null;
  ai_recommendation: string | null;
  ai_summary: string | null;
  created_at: string;
  evaluated_at: string | null;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#374151" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="block text-xs text-gray-400">/100</span>
      </div>
    </div>
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
    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${map[status] ?? 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () =>
    api.get(`/applications/${id}`).then((r) => setApp(r.data)).finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    await api.patch(`/applications/${id}/status`, { status });
    await load();
    setUpdating(false);
  };

  const reEvaluate = async () => {
    setUpdating(true);
    await api.post(`/applications/${id}/re-evaluate`);
    await load();
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!app) return <div className="p-8 text-gray-400">Application not found</div>;

  const strengths: string[] = app.ai_strengths ? JSON.parse(app.ai_strengths) : [];
  const weaknesses: string[] = app.ai_weaknesses ? JSON.parse(app.ai_weaknesses) : [];

  const recColor: Record<string, string> = {
    'Highly Recommended': 'text-green-400 bg-green-400/10',
    'Recommended': 'text-blue-400 bg-blue-400/10',
    'Consider': 'text-yellow-400 bg-yellow-400/10',
    'Not Recommended': 'text-red-400 bg-red-400/10',
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/applications')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{app.applicant_name}</h1>
          <p className="text-gray-400 mt-0.5">Applied for: <span className="text-white">{app.job_title}</span></p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Applicant Info</h2>
            <div className="space-y-3">
              {app.applicant_email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300">{app.applicant_email}</span>
                </div>
              )}
              {app.applicant_phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-300">{app.applicant_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a
                  href={`/uploads/${app.cv_path.split(/[\\/]/).pop()}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors truncate"
                >
                  {app.cv_filename}
                </a>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
              Applied {new Date(app.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => updateStatus('hired')}
                disabled={updating || app.status === 'hired'}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 disabled:opacity-40 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Mark as Hired
              </button>
              <button
                onClick={() => updateStatus('rejected')}
                disabled={updating || app.status === 'rejected'}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 disabled:opacity-40 text-red-400 rounded-lg text-sm font-medium transition-colors"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject
              </button>
              {(app.status === 'failed' || app.status === 'completed') && (
                <button
                  onClick={reEvaluate}
                  disabled={updating}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 disabled:opacity-40 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  Re-evaluate with AI
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {app.ai_score !== null ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="font-semibold text-white mb-6">AI Evaluation</h2>

              <div className="flex items-center gap-6 mb-6">
                <ScoreRing score={app.ai_score} />
                <div>
                  <p className="text-gray-400 text-sm mb-1">Recommendation</p>
                  {app.ai_recommendation && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${recColor[app.ai_recommendation] ?? 'text-gray-400 bg-gray-700'}`}>
                      {app.ai_recommendation}
                    </span>
                  )}
                  {app.evaluated_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Evaluated {new Date(app.evaluated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {app.ai_summary && (
                <div className="mb-5 p-4 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-300 leading-relaxed">{app.ai_summary}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strengths.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-green-400 mb-3">
                      <ThumbsUp className="w-4 h-4" /> Strengths
                    </h3>
                    <ul className="space-y-2">
                      {strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-green-400 mt-0.5 flex-shrink-0">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {weaknesses.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-red-400 mb-3">
                      <ThumbsDown className="w-4 h-4" /> Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {weaknesses.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              {app.status === 'evaluating' ? (
                <>
                  <Loader2 className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
                  <p className="text-white font-medium">AI is evaluating this resume...</p>
                  <p className="text-gray-400 text-sm mt-1">This usually takes less than a minute</p>
                </>
              ) : app.status === 'failed' ? (
                <>
                  <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                  <p className="text-white font-medium">Evaluation failed</p>
                  <p className="text-gray-400 text-sm mt-1">The PDF could not be processed. Try re-evaluating.</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-white font-medium">Pending evaluation</p>
                  <p className="text-gray-400 text-sm mt-1">AI will evaluate this resume shortly</p>
                </>
              )}
            </div>
          )}

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-3">Job Requirements</h2>
            <p className="text-gray-400 text-sm whitespace-pre-wrap leading-relaxed">{app.job_requirements}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
