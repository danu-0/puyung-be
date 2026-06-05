const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createStorage = (folder) => {
  const dir = `uploads/${folder}`;
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error("Hanya file gambar (jpg, png) dan PDF yang diizinkan"));
};

const uploadPengaduan = multer({
  storage: createStorage("pengaduan"),
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
}).array("foto", 5);

const uploadAdministrasi = multer({
  storage: createStorage("administrasi"),
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
}).array("dokumen", 10);

const uploadSingle = (folder) =>
  multer({
    storage: createStorage(folder),
    fileFilter,
    limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  }).single("foto");

module.exports = { uploadPengaduan, uploadAdministrasi, uploadSingle };
