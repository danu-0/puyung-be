const multer = require("multer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = process.env.SUPABASE_BUCKET || "puyung-serve";

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error("Hanya file gambar (jpg, png) dan PDF yang diizinkan"));
};

// Upload buffer ke Supabase Storage, return public URL
const uploadToSupabase = async (file, folder) => {
  const ext = path.extname(file.originalname);
  const filename = `${folder}/${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Upload gagal: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
};

const memoryStorage = multer.memoryStorage();
const opts = { storage: memoryStorage, fileFilter, limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 } };

const uploadPengaduan    = multer(opts).array("foto", 5);
const uploadAdministrasi = multer(opts).array("dokumen", 10);
const uploadSingle       = () => multer(opts).single("foto");

module.exports = { uploadPengaduan, uploadAdministrasi, uploadSingle, uploadToSupabase };