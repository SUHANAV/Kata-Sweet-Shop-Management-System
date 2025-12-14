import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(new Error('Only image uploads are allowed'));
  },
}).single('image');

router.post('/', requireAuth, requireAdmin, (req, res) => {
  upload(req, res, (err: unknown) => {
    if (err instanceof Error) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    const relativePath = `/uploads/${req.file.filename}`;
    return res.status(201).json({ url: relativePath });
  });
});

export default router;
