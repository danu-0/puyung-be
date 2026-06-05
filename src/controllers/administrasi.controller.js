const prisma = require("../db/prisma");
const response = require("../utils/response");
const { kirimNotifikasi, upsertAktivitas } = require("../utils/notification");

// POST /api/administrasi — Ajukan dokumen (user)
const ajukanAdministrasi = async (req, res) => {
  try {
    const { jenis, dataDiri } = req.body;
    const userId = req.user.id;

    if (!jenis || !dataDiri) return response.error(res, "Jenis dan data diri wajib diisi", 400);

    const dokumen = req.files ? req.files.map((f) => f.path) : [];

    let parsedData;
    try {
      parsedData = typeof dataDiri === "string" ? JSON.parse(dataDiri) : dataDiri;
    } catch {
      return response.error(res, "Format data diri tidak valid (harus JSON)", 400);
    }

    const admin = await prisma.administrasi.create({
      data: { userId, jenis, dataDiri: parsedData, dokumen },
    });

    const label = {
      KTP: "Pembuatan/Pembaruan KTP",
      KK: "Pembuatan/Pembaruan KK",
      SURAT_NIKAH: "Pengajuan Surat Nikah",
      AKTA_KELAHIRAN: "Pengajuan Akta Kelahiran",
      BANSOS: "Pengajuan Bansos",
    };

    await upsertAktivitas(userId, "administrasi", admin.id, label[jenis] || jenis, "MENUNGGU");

    return response.created(res, admin, "Pengajuan administrasi berhasil dikirim");
  } catch (err) {
    console.error(err);
    return response.error(res, "Gagal mengajukan administrasi");
  }
};

// GET /api/administrasi — List (user: milik sendiri, admin: semua)
const getAdministrasi = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, jenis } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (req.user.role === "PENDUDUK" || req.user.role === "PENDATANG") {
      where.userId = req.user.id;
    }
    if (status) where.status = status;
    if (jenis) where.jenis = jenis;

    const [data, total] = await Promise.all([
      prisma.administrasi.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        include: { user: { select: { nama: true, nomorHp: true } } },
      }),
      prisma.administrasi.count({ where }),
    ]);

    return response.paginate(res, data, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return response.error(res, "Gagal mengambil data administrasi");
  }
};

// GET /api/administrasi/:id
const getDetailAdministrasi = async (req, res) => {
  try {
    const data = await prisma.administrasi.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { nama: true, nomorHp: true, nik: true } } },
    });
    if (!data) return response.error(res, "Data tidak ditemukan", 404);
    return response.success(res, data);
  } catch (err) {
    return response.error(res);
  }
};

// PUT /api/administrasi/:id/status — Update status (admin)
const updateStatusAdministrasi = async (req, res) => {
  try {
    const { status, catatan } = req.body;
    const { id } = req.params;

    const admin = await prisma.administrasi.update({
      where: { id },
      data: { status, catatan },
    });

    const label = {
      KTP: "KTP", KK: "KK", SURAT_NIKAH: "Surat Nikah",
      AKTA_KELAHIRAN: "Akta Kelahiran", BANSOS: "Bansos",
    };

    const pesanStatus = {
      DIPROSES: `Pengajuan ${label[admin.jenis]} Anda sedang diproses`,
      SELESAI: `Pengajuan ${label[admin.jenis]} Anda telah selesai. Silakan ambil di kantor desa`,
      DITOLAK: `Pengajuan ${label[admin.jenis]} Anda ditolak. ${catatan || ""}`,
    };

    await kirimNotifikasi(
      admin.userId,
      `Update Pengajuan ${label[admin.jenis]}`,
      pesanStatus[status] || "Status pengajuan diperbarui",
      "administrasi",
      admin.id
    );

    await upsertAktivitas(admin.userId, "administrasi", admin.id, `Pengajuan ${label[admin.jenis]}`, status);

    return response.success(res, admin, "Status administrasi diperbarui");
  } catch (err) {
    return response.error(res, "Gagal update status administrasi");
  }
};

module.exports = { ajukanAdministrasi, getAdministrasi, getDetailAdministrasi, updateStatusAdministrasi };
