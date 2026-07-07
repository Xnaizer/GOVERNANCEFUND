import multer from "multer";
import { AppError } from "../utils/AppError";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOC_TYPES = ["application/pdf", ...IMAGE_TYPES];

function fileFilter(allowed: string[]) {
  return (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback,
  ) => {
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Unsupported file type: ${file.mimetype}`, 400));
    }
  };
}

export const imageUpload: any = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter(IMAGE_TYPES),
}).single("file");

export const documentUpload: any = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: fileFilter(DOC_TYPES),
}).single("file");
