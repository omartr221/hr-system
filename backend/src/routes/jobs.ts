import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const showAll = req.query.all === 'true';
  const result = showAll
    ? await db.execute('SELECT * FROM jobs ORDER BY created_at DESC')
    : await db.execute('SELECT * FROM jobs WHERE is_active = 1 ORDER BY created_at DESC');
  res.json(result.rows);
});

router.get('/:id', async (req: Request, res: Response) => {
  const result = await db.execute({ sql: 'SELECT * FROM jobs WHERE id = ?', args: [req.params.id] });
  const job = result.rows[0];
  if (!job) { res.status(404).json({ error: 'Job not found' }); return; }
  res.json(job);
});

router.post('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { title, description, requirements, salary_min, salary_max, currency } = req.body;
  if (!title || !description || !requirements) {
    res.status(400).json({ error: 'Title, description, and requirements are required' });
    return;
  }
  const ins = await db.execute({
    sql: `INSERT INTO jobs (title, description, requirements, salary_min, salary_max, currency)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [title, description, requirements, salary_min || null, salary_max || null, currency || 'USD'],
  });
  const job = await db.execute({ sql: 'SELECT * FROM jobs WHERE id = ?', args: [ins.lastInsertRowid] });
  res.status(201).json(job.rows[0]);
});

router.put('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { title, description, requirements, salary_min, salary_max, currency, is_active } = req.body;
  const existing = await db.execute({ sql: 'SELECT id FROM jobs WHERE id = ?', args: [req.params.id] });
  if (!existing.rows[0]) { res.status(404).json({ error: 'Job not found' }); return; }
  await db.execute({
    sql: `UPDATE jobs SET title=?, description=?, requirements=?,
          salary_min=?, salary_max=?, currency=?, is_active=? WHERE id=?`,
    args: [title, description, requirements, salary_min || null, salary_max || null,
           currency || 'USD', is_active !== undefined ? is_active : 1, req.params.id],
  });
  const updated = await db.execute({ sql: 'SELECT * FROM jobs WHERE id = ?', args: [req.params.id] });
  res.json(updated.rows[0]);
});

router.delete('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const existing = await db.execute({ sql: 'SELECT id FROM jobs WHERE id = ?', args: [req.params.id] });
  if (!existing.rows[0]) { res.status(404).json({ error: 'Job not found' }); return; }
  await db.execute({ sql: 'DELETE FROM jobs WHERE id = ?', args: [req.params.id] });
  res.json({ message: 'Job deleted successfully' });
});

export default router;
