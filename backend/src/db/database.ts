import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const isProduction = !!process.env.TURSO_DATABASE_URL;

if (!isProduction) {
  const dataDir = path.join(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

export const db = createClient(
  isProduction
    ? { url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN }
    : { url: `file:${path.join(__dirname, '../../data/hr.db')}` }
);

export async function initDb(): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      requirements TEXT NOT NULL,
      salary_min INTEGER,
      salary_max INTEGER,
      currency TEXT DEFAULT 'USD',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      applicant_name TEXT NOT NULL,
      applicant_email TEXT,
      applicant_phone TEXT,
      cv_filename TEXT NOT NULL,
      cv_path TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      ai_score INTEGER,
      ai_strengths TEXT,
      ai_weaknesses TEXT,
      ai_recommendation TEXT,
      ai_summary TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      evaluated_at DATETIME,
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
    );
  `);

  // Add cv_text column if it doesn't exist (for storing extracted PDF text)
  try {
    await db.execute('ALTER TABLE applications ADD COLUMN cv_text TEXT');
  } catch (_) { /* column already exists */ }

  const adminRes = await db.execute({ sql: 'SELECT id FROM users WHERE username = ?', args: ['admin'] });
  if (adminRes.rows.length === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    await db.execute({
      sql: 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      args: ['admin', passwordHash, 'admin'],
    });
    console.log('✅ Default admin created — username: admin | password: admin123');
  }

  // Seed demo data if no jobs exist
  const jobCount = await db.execute('SELECT COUNT(*) as count FROM jobs');
  if (Number((jobCount.rows[0] as any).count) === 0) {
    console.log('🌱 Seeding demo data...');

    // Demo Jobs
    await db.execute({
      sql: `INSERT INTO jobs (title, description, requirements, salary_min, salary_max, currency) VALUES (?, ?, ?, ?, ?, ?)`,
      args: ['Senior Frontend Developer', 'We are looking for an experienced Frontend Developer to join our growing team. You will be responsible for building modern, responsive web applications using React and TypeScript. You will work closely with designers and backend engineers to deliver exceptional user experiences.', '- 3+ years React/TypeScript experience\n- Strong CSS/Tailwind skills\n- Experience with REST APIs\n- Git proficiency\n- English fluency', 4000, 7000, 'USD'],
    });
    await db.execute({
      sql: `INSERT INTO jobs (title, description, requirements, salary_min, salary_max, currency) VALUES (?, ?, ?, ?, ?, ?)`,
      args: ['UI/UX Designer', 'Join our design team to create beautiful and intuitive user interfaces. You will conduct user research, create wireframes and prototypes, and work with developers to bring designs to life.', '- 2+ years UI/UX design experience\n- Proficiency in Figma or Sketch\n- Strong portfolio\n- Understanding of design systems\n- User research skills', 3500, 6000, 'USD'],
    });
    await db.execute({
      sql: `INSERT INTO jobs (title, description, requirements, salary_min, salary_max, currency) VALUES (?, ?, ?, ?, ?, ?)`,
      args: ['Backend Engineer (Node.js)', 'We need a skilled Backend Engineer to build and maintain our API services. You will design database schemas, implement REST APIs, and ensure high availability and performance.', '- 3+ years Node.js/Express experience\n- SQL and NoSQL databases\n- REST API design\n- Docker knowledge\n- CI/CD pipelines', 5000, 8000, 'USD'],
    });

    // Demo Applications with pre-completed AI evaluations
    const demoApps = [
      { jobId: 1, name: 'Sarah Johnson', email: 'sarah@email.com', score: 92,
        strengths: '["5+ years React/TypeScript experience with major projects","Strong portfolio with responsive web apps","Experience leading frontend teams","Excellent CSS/Tailwind skills with design system experience","Active open-source contributor"]',
        weaknesses: '["No experience with Vue.js or Angular","Limited backend knowledge","No mobile development experience"]',
        rec: 'Highly Recommended', summary: 'Exceptional frontend developer with strong React expertise and leadership experience. Her portfolio demonstrates high-quality work and she exceeds most job requirements. A top candidate for this role.' },
      { jobId: 1, name: 'Ahmed Hassan', email: 'ahmed@email.com', score: 74,
        strengths: '["3 years React experience","Good understanding of TypeScript","Experience with REST API integration","Familiar with Git workflows"]',
        weaknesses: '["Limited Tailwind CSS experience - mainly uses Bootstrap","No team leadership experience","Portfolio shows mostly small projects","English proficiency could be stronger"]',
        rec: 'Recommended', summary: 'Solid frontend developer who meets the core requirements. Has room for growth in CSS frameworks and project scale, but demonstrates good fundamentals and learning ability.' },
      { jobId: 1, name: 'Maria Garcia', email: 'maria@email.com', score: 45,
        strengths: '["1 year React experience","Completed several online courses","Shows enthusiasm for learning","Basic TypeScript knowledge"]',
        weaknesses: '["Only 1 year of professional experience vs 3+ required","No production-scale project experience","Limited CSS skills","No experience with modern tooling like Vite or Webpack"]',
        rec: 'Not Recommended', summary: 'Junior developer who shows potential but currently lacks the required experience level. Would be a better fit for a junior or intern position.' },
      { jobId: 2, name: 'Emma Wilson', email: 'emma@email.com', score: 88,
        strengths: '["4 years UI/UX design experience at top agencies","Outstanding Figma portfolio with 50+ projects","Strong user research methodology","Experience building design systems from scratch","Excellent visual design sense"]',
        weaknesses: '["No experience with Sketch specifically","Limited animation/motion design skills","Most work is in B2C, less B2B experience"]',
        rec: 'Highly Recommended', summary: 'Excellent designer with a strong portfolio and proven track record. Her design system experience and user research skills make her an ideal candidate for this role.' },
      { jobId: 2, name: 'David Chen', email: 'david@email.com', score: 67,
        strengths: '["2 years UI design experience","Good Figma skills","Clean visual design style","Understanding of accessibility standards"]',
        weaknesses: '["Limited UX research experience","Portfolio is small (8 projects)","No experience building design systems","Weak in interaction design"]',
        rec: 'Consider', summary: 'Competent UI designer with good visual skills but lacking in UX research depth. Could grow into the role with mentorship but may need time to meet full expectations.' },
      { jobId: 3, name: 'James Miller', email: 'james@email.com', score: 85,
        strengths: '["5 years Node.js/Express experience","Strong SQL and MongoDB knowledge","Experience with Docker and Kubernetes","Built APIs serving 100K+ users","Good understanding of security practices"]',
        weaknesses: '["No experience with GraphQL","Limited cloud-native experience (mainly on-premise)","Could improve on documentation practices"]',
        rec: 'Highly Recommended', summary: 'Strong backend engineer with extensive Node.js experience and proven ability to build scalable systems. His API design skills and database knowledge make him a top candidate.' },
      { jobId: 3, name: 'Lisa Park', email: 'lisa@email.com', score: 78,
        strengths: '["3 years Node.js experience","Good PostgreSQL and Redis knowledge","Experience with CI/CD pipelines","Clean code practices","Experience with microservices architecture"]',
        weaknesses: '["No Docker experience","Limited experience with NoSQL databases","Has not worked with high-traffic systems"]',
        rec: 'Recommended', summary: 'Solid backend developer who meets most requirements. The Docker gap is addressable with training. Her microservices experience and clean coding practices are valuable assets.' },
    ];

    for (const app of demoApps) {
      await db.execute({
        sql: `INSERT INTO applications (job_id, applicant_name, applicant_email, cv_filename, cv_path, status, ai_score, ai_strengths, ai_weaknesses, ai_recommendation, ai_summary, evaluated_at, cv_text)
              VALUES (?, ?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
        args: [app.jobId, app.name, app.email, 'demo-cv.pdf', '/demo/cv.pdf', app.score, app.strengths, app.weaknesses, app.rec, app.summary, 'Demo CV content'],
      });
    }

    console.log('✅ Demo data seeded: 3 jobs + 7 evaluated applications');
  }

  console.log('✅ Database initialized');
}
