import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists securely
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
// Security: Never trust the original filename to prevent path traversal
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate safe, unique filename
    const ext = path.extname(file.originalname).toLowerCase();
    const safeFilename = `${uuidv4()}${ext}`;
    cb(null, safeFilename);
  }
});

// File Filter Configuration
// Security: Validate MIME type strictly
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, and JPEG are allowed.'));
  }
};

// Upload Middleware
// Security: Enforce max file size (5MB)
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
});

export const uploadResume = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded or invalid file type.' });
  }

  // Assuming `req.user.userId` exists from the authentication middleware
  const userId = (req as any).user?.userId || 'unknown-user';
  
  // Log the successful upload securely without logging file contents
  console.log(`User ${userId} uploaded a resume: ${req.file.filename} (${req.file.size} bytes)`);

  res.status(200).json({
    success: true,
    message: 'File uploaded successfully.',
    data: {
      filename: req.file.filename,
      size: req.file.size
    }
  });
};
