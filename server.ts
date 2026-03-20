import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import db from './db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-vf5';

const app = express();
app.use(express.json());

// Setup uploads folder
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware to verify token
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// API Routes
app.get('/api/public-data', (req, res) => {
  const contentRows = db.prepare('SELECT * FROM content').all() as {key: string, value: string}[];
  const content = contentRows.reduce((acc, row) => {
    try {
      acc[row.key] = JSON.parse(row.value);
    } catch {
      acc[row.key] = row.value;
    }
    return acc;
  }, {} as any);

  const gallery = db.prepare('SELECT * FROM gallery').all();
  const reviews = db.prepare('SELECT * FROM reviews').all();
  res.json({ ...content, gallery, reviews });
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
});

app.put('/api/admin/content', authenticate, (req, res) => {
  const updates = req.body; // { banner: {...}, intro: {...} }
  const stmt = db.prepare('UPDATE content SET value = ? WHERE key = ?');
  const insertStmt = db.prepare('INSERT OR IGNORE INTO content (key, value) VALUES (?, ?)');
  
  db.transaction(() => {
    for (const [key, value] of Object.entries(updates)) {
      const valStr = typeof value === 'string' ? value : JSON.stringify(value);
      const result = stmt.run(valStr, key);
      if (result.changes === 0) {
        insertStmt.run(key, valStr);
      }
    }
  })();
  res.json({ success: true });
});

app.post('/api/admin/upload-image', authenticate, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.post('/api/admin/gallery', authenticate, (req, res) => {
  const { url } = req.body;
  const info = db.prepare('INSERT INTO gallery (url) VALUES (?)').run(url);
  res.json({ id: info.lastInsertRowid, url });
});

app.delete('/api/admin/gallery/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const image = db.prepare('SELECT url FROM gallery WHERE id = ?').get(id) as any;
  if (image) {
    const filePath = path.join(process.cwd(), image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    db.prepare('DELETE FROM gallery WHERE id = ?').run(id);
  }
  res.json({ success: true });
});

app.post('/api/admin/reviews', authenticate, (req, res) => {
  const { customerName, rating, comment, avatarUrl } = req.body;
  const info = db.prepare('INSERT INTO reviews (customerName, rating, comment, avatarUrl) VALUES (?, ?, ?, ?)').run(customerName, rating, comment, avatarUrl);
  res.json({ id: info.lastInsertRowid, customerName, rating, comment, avatarUrl });
});

app.put('/api/admin/reviews/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { customerName, rating, comment, avatarUrl } = req.body;
  db.prepare('UPDATE reviews SET customerName = ?, rating = ?, comment = ?, avatarUrl = ? WHERE id = ?').run(customerName, rating, comment, avatarUrl, id);
  res.json({ success: true });
});

app.delete('/api/admin/reviews/:id', authenticate, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
  res.json({ success: true });
});

async function startServer() {
  // cPanel Passenger sẽ tự động truyền port qua process.env.PORT
  const PORT = process.env.PORT || 3000;
  const distPath = path.join(process.cwd(), 'dist');

  if (fs.existsSync(path.join(distPath, 'index.html'))) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
