const multer = require('multer');
const path = require('path');
const fs = require('fs');

/** Absolute uploads root for mkdir; multer still gets a cwd-relative path for DB consistency. */
const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const userId = req.user._id.toString();
      let type = 'others';

      if (file.mimetype.startsWith('image/')) type = 'images';
      else if (file.mimetype === 'application/pdf') type = 'pdf';
      else if (file.mimetype.includes('msword') || file.mimetype.includes('officedocument')) type = 'docs';

      const relativePath = path.join('uploads', userId, type);
      fs.mkdirSync(path.join(UPLOADS_ROOT, userId, type), { recursive: true });
      cb(null, relativePath);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALLOWED_EXT = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.doc', '.docx']);

const fileFilter = (req, file, cb) => {
  // Normalize common Android/picker quirks before checking
  if (file.mimetype === 'image/jpg') file.mimetype = 'image/jpeg';

  const ext = path.extname(file.originalname || '').toLowerCase();
  const mimeOk = ALLOWED_MIME.has(file.mimetype);
  // DocumentPicker often sends application/octet-stream — allow by extension
  const extOk =
    ALLOWED_EXT.has(ext) &&
    (file.mimetype === 'application/octet-stream' || file.mimetype.startsWith('image/') || mimeOk);

  if (mimeOk || extOk) {
    if (file.mimetype === 'application/octet-stream') {
      const byExt = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
      if (byExt[ext]) file.mimetype = byExt[ext];
    }
    cb(null, true);
  } else {
    const err = new Error('Invalid file type. Only PDF, Images and Docs are allowed.');
    err.statusCode = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

module.exports = upload;