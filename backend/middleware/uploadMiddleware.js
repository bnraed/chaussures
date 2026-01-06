import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = "uploads";

// crée le dossier uploads s’il n’existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);

    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ok = /image\/(png|jpeg|jpg|webp)/.test(file.mimetype);
  if (!ok) return cb(new Error("Format image non supporté (png/jpg/jpeg/webp)"));
  cb(null, true);
}

export const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
