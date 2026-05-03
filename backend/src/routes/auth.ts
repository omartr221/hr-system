import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }

  const result = await db.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [username] });
  const user = result.rows[0] as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash as string)) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

router.get('/me', authenticate, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

export default router;
