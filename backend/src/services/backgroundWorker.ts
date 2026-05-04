import { db } from '../db/database';
import { evaluateResume } from './aiEvaluator';

let isProcessing = false;

async function processPendingApplications(): Promise<void> {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const pendingRes = await db.execute(
      `SELECT a.*, j.title as job_title, j.description as job_description,
              j.requirements as job_requirements
       FROM applications a JOIN jobs j ON a.job_id = j.id
       WHERE a.status = 'pending' LIMIT 5`
    );
    const pending = pendingRes.rows as any[];

    if (pending.length > 0) {
      console.log(`[Worker] Processing ${pending.length} pending application(s)...`);
    }


    for (const application of pending) {
      // Skip old applications that have no cv_text and lost their PDF file
      const hasCvText = application.cv_text && (application.cv_text as string).length >= 50;
      const fs = await import('fs');
      const hasFile = fs.existsSync(application.cv_path as string);
      if (!hasCvText && !hasFile) {
        console.log(`[Worker] ⏭️  Skipping application #${application.id} — no CV text and PDF file missing`);
        await db.execute({ sql: "UPDATE applications SET status = 'failed' WHERE id = ?", args: [application.id] });
        continue;
      }

      try {
        await db.execute({ sql: "UPDATE applications SET status = 'evaluating' WHERE id = ?", args: [application.id] });

        const result = await evaluateResume(
          application.cv_path as string,
          application.job_title as string,
          application.job_description as string,
          application.job_requirements as string,
          application.cv_text as string | null
        );

        await db.execute({
          sql: `UPDATE applications SET status='completed', ai_score=?, ai_strengths=?,
                ai_weaknesses=?, ai_recommendation=?, ai_summary=?, evaluated_at=CURRENT_TIMESTAMP
                WHERE id=?`,
          args: [result.score, JSON.stringify(result.strengths), JSON.stringify(result.weaknesses),
                 result.recommendation, result.summary, application.id],
        });

        console.log(`[Worker] ✅ Application #${application.id} evaluated — score: ${result.score}/100`);
      } catch (error: any) {
        const message = error instanceof Error ? error.message : String(error);
        if (error.rateLimited) {
          // Rate limited — put back to pending, will retry next cycle
          console.log(`[Worker] ⏳ Application #${application.id} rate limited — will retry in 30s`);
          await db.execute({ sql: "UPDATE applications SET status = 'pending' WHERE id = ?", args: [application.id] });
        } else {
          console.error(`[Worker] ❌ Failed to evaluate application #${application.id}: ${message}`);
          await db.execute({ sql: "UPDATE applications SET status = 'failed' WHERE id = ?", args: [application.id] });
        }
      }
    }
  } finally {
    isProcessing = false;
  }
}

export async function startBackgroundWorker(): Promise<void> {
  const stuck = await db.execute(`UPDATE applications SET status='pending' WHERE status = 'evaluating'`);
  if (stuck.rowsAffected > 0) {
    console.log(`[Worker] ♻️  Reset ${stuck.rowsAffected} stuck/failed application(s) to pending`);
  }
  console.log('[Worker] Background evaluation worker started (interval: 30s)');
  setInterval(processPendingApplications, 30_000);
  processPendingApplications();
}
