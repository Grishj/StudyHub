import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory structure
const uploadDirs = [
  "general",
  "notes",
  "questions",
  "syllabus",
  "profile",
  "group",
  "chat",
];
const uploadDir = path.join(__dirname, "../../uploads");

uploadDirs.forEach((dir) => {
  const dirPath = path.join(uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category =
      req.body.category || req.baseUrl.includes("chat") ? "chat" : "general";
    const categoryPath = path.join(uploadDir, category);

    if (!fs.existsSync(categoryPath)) {
      fs.mkdirSync(categoryPath, { recursive: true });
    }

    cb(null, categoryPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

// File filter - Allow images, documents, and videos for chat
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    // Videos (for chat)
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    // Audio (for chat)
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images, PDFs, documents, videos, and audio files are allowed."
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for chat files (videos, etc.)
  },
});
