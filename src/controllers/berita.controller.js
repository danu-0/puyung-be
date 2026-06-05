const prisma = require("../db/prisma");
const response = require("../utils/response");
const { uploadToSupabase } = require("../middlewares/upload.middleware");

// GET /api/berita — List semua berita
const getBerita = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [data, total] = await Promise.all([
      prisma.berita.findMany({ skip, take: parseInt(limit), orderBy: { createdAt: "desc" } }),
      prisma.berita.count(),
    ]);

    return response.paginate(res, data, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return response.error(res, "Gagal mengambil berita");
  }
};

// GET /api/berita/:id
const getDetailBerita = async (req, res) => {
  try {
    const berita = await prisma.berita.findUnique({ where: { id: req.params.id } });
    if (!berita) return response.error(res, "Berita tidak ditemukan", 404);
    return response.success(res, berita);
  } catch (err) {
    return response.error(res);
  }
};

// POST /api/berita — Buat berita (admin)
const buatBerita = async (req, res) => {
  try {
    const { judul, isi, penulis } = req.body;
    if (!judul || !isi) return response.error(res, "Judul dan isi wajib diisi", 400);

    const foto = req.file ? await uploadToSupabase(req.file, "berita") : null;

    const berita = await prisma.berita.create({
      data: { judul, isi, foto, penulis: penulis || req.user.nama },
    });

    return response.created(res, berita, "Berita berhasil dibuat");
  } catch (err) {
    return response.error(res, "Gagal membuat berita");
  }
};

// PUT /api/berita/:id — Edit berita (admin)
const editBerita = async (req, res) => {
  try {
    const { judul, isi, penulis } = req.body;
    const foto = req.file ? await uploadToSupabase(req.file, "tempat") : undefined;

    const berita = await prisma.berita.update({
      where: { id: req.params.id },
      data: { judul, isi, penulis, ...(foto && { foto }) },
    });

    return response.success(res, berita, "Berita berhasil diperbarui");
  } catch (err) {
    return response.error(res, "Gagal edit berita");
  }
};

// DELETE /api/berita/:id — Hapus berita (admin)
const hapusBerita = async (req, res) => {
  try {
    await prisma.berita.delete({ where: { id: req.params.id } });
    return response.success(res, null, "Berita berhasil dihapus");
  } catch (err) {
    return response.error(res, "Gagal hapus berita");
  }
};

module.exports = { getBerita, getDetailBerita, buatBerita, editBerita, hapusBerita };
