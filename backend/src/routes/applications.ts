import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import { db } from '../db/database';
import { authenticate, requireAdmin } from '../middleware/auth';

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

function handleUpload(req: Request, res: Response, next: NextFunction) {
  upload.single('cv')(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}

const router = Router();

router.post('/apply/:jobId', handleUpload, async (req: Request, res: Response) => {
  const { applicant_name, applicant_email, applicant_phone } = req.body;
  const jobId = String(req.params.jobId);

  if (!applicant_name) { res.status(400).json({ error: 'Name is required' }); return; }
  if (!req.file) { res.status(400).json({ error: 'CV (PDF) file is required' }); return; }

  const jobRes = await db.execute({ sql: 'SELECT id FROM jobs WHERE id = ? AND is_active = 1', args: [jobId] });
  if (!jobRes.rows[0]) { res.status(404).json({ error: 'Job not found or no longer active' }); return; }

  // Extract text from PDF immediately so it's stored in DB
  let cvText = '';
  try {
    const buffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(buffer);
    cvText = data.text.trim();
  } catch (e) {
    console.log('[Upload] Warning: could not extract PDF text:', e);
  }

  const ins = await db.execute({
    sql: `INSERT INTO applications
            (job_id, applicant_name, applicant_email, applicant_phone, cv_filename, cv_path, cv_text, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    args: [jobId, applicant_name, applicant_email || null, applicant_phone || null,
           req.file.originalname, req.file.path, cvText || null],
  });
  const appRes = await db.execute({ sql: 'SELECT * FROM applications WHERE id = ?', args: [Number(ins.lastInsertRowid)] });
  res.status(201).json({ message: 'Application submitted successfully', application: appRes.rows[0] });
});

router.get('/', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { jobId, status } = req.query;
  let query = `SELECT a.*, j.title as job_title FROM applications a JOIN jobs j ON a.job_id = j.id WHERE 1=1`;
  const args: (string | number)[] = [];

  if (jobId) { query += ' AND a.job_id = ?'; args.push(String(jobId)); }
  if (status) { query += ' AND a.status = ?'; args.push(String(status)); }
  query += ' ORDER BY a.created_at DESC';

  const result = await db.execute({ sql: query, args });
  res.json(result.rows);
});

router.get('/:id', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const result = await db.execute({
    sql: `SELECT a.*, j.title as job_title, j.requirements as job_requirements,
                 j.description as job_description
          FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.id = ?`,
    args: [String(req.params.id)],
  });
  if (!result.rows[0]) { res.status(404).json({ error: 'Application not found' }); return; }
  res.json(result.rows[0]);
});

router.patch('/:id/status', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'evaluating', 'completed', 'failed', 'hired', 'rejected'];
  if (!validStatuses.includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }

  const id = String(req.params.id);
  const existing = await db.execute({ sql: 'SELECT id FROM applications WHERE id = ?', args: [id] });
  if (!existing.rows[0]) { res.status(404).json({ error: 'Application not found' }); return; }

  await db.execute({ sql: 'UPDATE applications SET status = ? WHERE id = ?', args: [status, id] });
  const updated = await db.execute({ sql: 'SELECT * FROM applications WHERE id = ?', args: [id] });
  res.json(updated.rows[0]);
});

router.post('/:id/re-evaluate', authenticate, requireAdmin, async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const existing = await db.execute({ sql: 'SELECT id FROM applications WHERE id = ?', args: [id] });
  if (!existing.rows[0]) { res.status(404).json({ error: 'Application not found' }); return; }
  await db.execute({ sql: "UPDATE applications SET status = 'pending' WHERE id = ?", args: [id] });
  res.json({ message: 'Application queued for re-evaluation' });
});

export default router;
