import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadFile, getDocuments } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';

import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

router.use(authMiddleware);

// @route   POST /api/upload
// @desc    Upload a file for vision processing
router.post('/', upload.single('file'), uploadFile);

// @route   GET /api/upload
// @desc    Get user's uploaded documents
router.get('/', getDocuments);

export default router;
