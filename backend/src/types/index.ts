export interface User {
  id: number;
  username: string;
  password_hash: string;
  role: string;
  created_at: string;
}

export interface Job {
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

export interface Application {
  id: number;
  job_id: number;
  applicant_name: string;
  applicant_email: string | null;
  applicant_phone: string | null;
  cv_filename: string;
  cv_path: string;
  status: 'pending' | 'evaluating' | 'completed' | 'failed' | 'hired' | 'rejected';
  ai_score: number | null;
  ai_strengths: string | null;
  ai_weaknesses: string | null;
  ai_recommendation: string | null;
  ai_summary: string | null;
  created_at: string;
  evaluated_at: string | null;
}

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}
