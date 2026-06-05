const prisma = require("../db/prisma");
const response = require("../utils/response");
const { kirimNotifikasi, upsertAktivitas } = require("../utils/notification");
const { uploadToSupabase } = require("../middlewares/upload.middleware");

// POST /api/pengaduan — Buat laporan baru (user)
const buatPengaduan = async (req, res) => {
  try {
    const { judul, deskripsi, lokasi, latitude, longitude, waktu } = req.body;
    const userId = req.user.id;

    if (!judul || !deskripsi || !lokasi) {
      return response.error(
        res,
        "Judul, deskripsi, dan lokasi wajib diisi",
        400,
      );
    }

    const foto =
      req.files && req.files.length > 0
        ? await Promise.all(
            req.files.map((f) => uploadToSupabase(f, "pengaduan")),
          )
        : [];

    const pengaduan = await prisma.pengaduan.create({
      data: {
        userId,
        judul,
        deskripsi,
        lokasi,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        waktu: waktu ? new Date(waktu) : new Date(),
        foto,
      },
    });

    // Simpan ke aktivitas user
    await upsertAktivitas(userId, "pengaduan", pengaduan.id, judul, "MENUNGGU");

    return response.created(res, pengaduan, "Pengaduan berhasil dikirim");
  } catch (err) {
    console.error(err);
    return response.error(res, "Gagal membuat pengaduan");
  }
};

// GET /api/pengaduan — List pengaduan milik user (user) atau semua (admin)
const getPengaduan = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (req.user.role === "PENDUDUK" || req.user.role === "PENDATANG") {
      where.userId = req.user.id;
    }
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.pengaduan.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: { user: { select: { nama: true, nomorHp: true } } },
      }),
      prisma.pengaduan.count({ where }),
    ]);

    return response.paginate(res, data, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    return response.error(res, "Gagal mengambil data pengaduan");
  }
};

// GET /api/pengaduan/:id — Detail pengaduan
const getDetailPengaduan = async (req, res) => {
  try {
    const pengaduan = await prisma.pengaduan.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { nama: true, nomorHp: true } } },
    });
    if (!pengaduan)
      return response.error(res, "Pengaduan tidak ditemukan", 404);
    return response.success(res, pengaduan);
  } catch (err) {
    return response.error(res);
  }
};

// PUT /api/pengaduan/:id/status — Update status (admin only)
const updateStatusPengaduan = async (req, res) => {
  try {
    const { status, catatan } = req.body;
    const { id } = req.params;

    const pengaduan = await prisma.pengaduan.update({
      where: { id },
      data: { status, catatan },
    });

    // Kirim notifikasi ke pelapor
    const pesanStatus = {
      DIPROSES: "Pengaduan Anda sedang diproses oleh pihak desa",
      SELESAI: "Pengaduan Anda telah selesai ditangani",
      DITOLAK: `Pengaduan Anda ditolak. ${catatan || ""}`,
    };

    await kirimNotifikasi(
      pengaduan.userId,
      `Update Pengaduan: ${pengaduan.judul}`,
      pesanStatus[status] || "Status pengaduan diperbarui",
      "pengaduan",
      pengaduan.id,
    );

    await upsertAktivitas(
      pengaduan.userId,
      "pengaduan",
      pengaduan.id,
      pengaduan.judul,
      status,
    );

    return response.success(res, pengaduan, "Status pengaduan diperbarui");
  } catch (err) {
    return response.error(res, "Gagal update status pengaduan");
  }
};

module.exports = {
  buatPengaduan,
  getPengaduan,
  getDetailPengaduan,
  updateStatusPengaduan,
};
