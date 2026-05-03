import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, requireAdmin, async (_req: Request, res: Response) => {
  const count = async (sql: string) => {
    const r = await db.execute(sql);
    return Number((r.rows[0] as any).count);
  };

  const [totalJobs, activeJobs, totalApplications, pendingEvaluations, completedEvaluations, hiredCount] =
    await Promise.all([
      count('SELECT COUNT(*) as count FROM jobs'),
      count('SELECT COUNT(*) as count FROM jobs WHERE is_active = 1'),
      count('SELECT COUNT(*) as count FROM applications'),
      count("SELECT COUNT(*) as count FROM applications WHERE status = 'pending'"),
      count("SELECT COUNT(*) as count FROM applications WHERE status = 'completed'"),
      count("SELECT COUNT(*) as count FROM applications WHERE status = 'hired'"),
    ]);

  const avgRes = await db.execute('SELECT AVG(ai_score) as avg FROM applications WHERE ai_score IS NOT NULL');
  const avgScore = (avgRes.rows[0] as any)?.avg ? Math.round(Number((avgRes.rows[0] as any).avg)) : null;

  const byJobRes = await db.execute(
    `SELECT j.title, j.id, COUNT(a.id) as count, AVG(a.ai_score) as avg_score
     FROM jobs j LEFT JOIN applications a ON j.id = a.job_id
     GROUP BY j.id ORDER BY count DESC LIMIT 10`
  );

  const recentRes = await db.execute(
    `SELECT a.*, j.title as job_title FROM applications a
     JOIN jobs j ON a.job_id = j.id ORDER BY a.created_at DESC LIMIT 8`
  );

  res.json({
    totalJobs, activeJobs, totalApplications, pendingEvaluations,
    completedEvaluations, hiredCount, avgScore,
    applicationsByJob: byJobRes.rows,
    recentApplications: recentRes.rows,
  });
});

export default router;
