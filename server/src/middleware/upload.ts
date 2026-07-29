import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { RequestHandler } from 'express';
import { ApiError } from '../utils/apiError';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB strict limit

const multerInstance = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Disallow dangerous executable extensions regardless of MIME claim
    if (['.exe', '.sh', '.bat', '.cmd', '.js', '.vbs', '.php', '.py'].includes(ext)) {
      return cb(
        new ApiError(400, `Executable file extensions like ${ext} are strictly prohibited.`)
      );
    }

    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, `Unsupported file MIME type '${file.mimetype}'`));
    }
  },
}).single('file');

export const uploadAttachmentMiddleware: RequestHandler = (req, res, next) => {
  multerInstance(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new ApiError(400, 'File size exceeds maximum allowable threshold of 5MB'));
      }
      return next(new ApiError(400, `File upload error: ${err.message}`));
    } else if (err) {
      return next(err);
    }
    next();
  });
};
