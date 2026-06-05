const prisma = require("../db/prisma");
const response = require("../utils/response");
const bcrypt = require("bcrypt");

// ─── Notifikasi ────────────────────────────────────────────────────────────────

// GET /api/notifikasi — List notifikasi milik user
const getNotifikasi = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [data, total, unread] = await Promise.all([
      prisma.notifikasi.findMany({
        where: { userId: req.user.id },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.notifikasi.count({ where: { userId: req.user.id } }),
      prisma.notifikasi.count({ where: { userId: req.user.id, dibaca: false } }),
    ]);

    return response.paginate(res, data, { total, unread, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { return response.error(res); }
};

// PUT /api/notifikasi/:id/baca — Tandai 1 notifikasi dibaca
const bacaNotifikasi = async (req, res) => {
  try {
    await prisma.notifikasi.update({
      where: { id: req.params.id },
      data: { dibaca: true },
    });
    return response.success(res, null, "Notifikasi ditandai dibaca");
  } catch (err) { return response.error(res); }
};

// PUT /api/notifikasi/baca-semua — Tandai semua notifikasi dibaca
const bacaSemuaNotifikasi = async (req, res) => {
  try {
    await prisma.notifikasi.updateMany({
      where: { userId: req.user.id, dibaca: false },
      data: { dibaca: true },
    });
    return response.success(res, null, "Semua notifikasi ditandai dibaca");
  } catch (err) { return response.error(res); }
};

// ─── Aktivitas ─────────────────────────────────────────────────────────────────

// GET /api/aktivitas — List aktivitas user
const getAktivitas = async (req, res) => {
  try {
    const { tipe } = req.query;
    const where = { userId: req.user.id };
    if (tipe) where.tipe = tipe;

    const data = await prisma.aktivitas.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });
    return response.success(res, data);
  } catch (err) { return response.error(res); }
};

// ─── User / Profil ─────────────────────────────────────────────────────────────

// GET /api/users/profil
const getProfil = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nomorHp: true, nama: true, role: true, foto: true, alamat: true, nik: true, createdAt: true },
    });
    return response.success(res, user);
  } catch (err) { return response.error(res); }
};

// PUT /api/users/profil
const updateProfil = async (req, res) => {
  try {
    const { nama, alamat, nik } = req.body;
    const foto = req.file ? req.file.path : undefined;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { nama, alamat, nik, ...(foto && { foto }) },
      select: { id: true, nomorHp: true, nama: true, role: true, foto: true, alamat: true, nik: true },
    });

    return response.success(res, user, "Profil berhasil diperbarui");
  } catch (err) { return response.error(res, "Gagal update profil"); }
};

// PUT /api/users/ganti-password
const gantiPassword = async (req, res) => {
  try {
    const { passwordLama, passwordBaru } = req.body;
    if (!passwordLama || !passwordBaru) return response.error(res, "Password lama dan baru wajib diisi", 400);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(passwordLama, user.password);
    if (!valid) return response.error(res, "Password lama salah", 401);

    const hashed = await bcrypt.hash(passwordBaru, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });

    return response.success(res, null, "Password berhasil diubah");
  } catch (err) { return response.error(res, "Gagal ganti password"); }
};

// GET /api/users — List semua user (admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = role ? { role } : {};

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: { id: true, nomorHp: true, nama: true, role: true, alamat: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return response.paginate(res, data, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) { return response.error(res); }
};

module.exports = {
  getNotifikasi, bacaNotifikasi, bacaSemuaNotifikasi,
  getAktivitas,
  getProfil, updateProfil, gantiPassword, getAllUsers,
};
