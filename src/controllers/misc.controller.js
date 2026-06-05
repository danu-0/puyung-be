const prisma = require("../db/prisma");
const response = require("../utils/response");

// ─── Harga Pangan ──────────────────────────────────────────────────────────────
const getHargaPangan = async (req, res) => {
  try {
    const data = await prisma.hargaPangan.findMany({ orderBy: { namaBarang: "asc" } });
    return response.success(res, data);
  } catch (err) { return response.error(res); }
};

const tambahHarga = async (req, res) => {
  try {
    const { namaBarang, harga, satuan } = req.body;
    if (!namaBarang || !harga || !satuan) return response.error(res, "Semua field wajib diisi", 400);
    const data = await prisma.hargaPangan.create({ data: { namaBarang, harga: parseFloat(harga), satuan } });
    return response.created(res, data, "Harga pangan berhasil ditambahkan");
  } catch (err) { return response.error(res, "Gagal tambah harga"); }
};

const updateHarga = async (req, res) => {
  try {
    const { namaBarang, harga, satuan } = req.body;
    const data = await prisma.hargaPangan.update({
      where: { id: req.params.id },
      data: { namaBarang, harga: harga ? parseFloat(harga) : undefined, satuan },
    });
    return response.success(res, data, "Harga pangan diperbarui");
  } catch (err) { return response.error(res, "Gagal update harga"); }
};

const hapusHarga = async (req, res) => {
  try {
    await prisma.hargaPangan.delete({ where: { id: req.params.id } });
    return response.success(res, null, "Harga pangan dihapus");
  } catch (err) { return response.error(res); }
};

// ─── Tempat ────────────────────────────────────────────────────────────────────
const getTempat = async (req, res) => {
  try {
    const { kategori } = req.query;
    const where = kategori ? { kategori } : {};
    const data = await prisma.tempat.findMany({ where, orderBy: { nama: "asc" } });
    return response.success(res, data);
  } catch (err) { return response.error(res); }
};

const getDetailTempat = async (req, res) => {
  try {
    const data = await prisma.tempat.findUnique({ where: { id: req.params.id } });
    if (!data) return response.error(res, "Tempat tidak ditemukan", 404);
    return response.success(res, data);
  } catch (err) { return response.error(res); }
};

const tambahTempat = async (req, res) => {
  try {
    const { nama, deskripsi, kategori, alamat, latitude, longitude } = req.body;
    if (!nama || !kategori || !alamat || !latitude || !longitude) {
      return response.error(res, "Field wajib belum lengkap", 400);
    }
    const foto = req.file ? req.file.path : null;
    const data = await prisma.tempat.create({
      data: { nama, deskripsi, kategori, alamat, latitude: parseFloat(latitude), longitude: parseFloat(longitude), foto },
    });
    return response.created(res, data, "Tempat berhasil ditambahkan");
  } catch (err) { return response.error(res, "Gagal tambah tempat"); }
};

const updateTempat = async (req, res) => {
  try {
    const { nama, deskripsi, kategori, alamat, latitude, longitude } = req.body;
    const foto = req.file ? req.file.path : undefined;
    const data = await prisma.tempat.update({
      where: { id: req.params.id },
      data: {
        nama, deskripsi, kategori, alamat,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        ...(foto && { foto }),
      },
    });
    return response.success(res, data, "Tempat diperbarui");
  } catch (err) { return response.error(res); }
};

const hapusTempat = async (req, res) => {
  try {
    await prisma.tempat.delete({ where: { id: req.params.id } });
    return response.success(res, null, "Tempat dihapus");
  } catch (err) { return response.error(res); }
};

// ─── Darurat ───────────────────────────────────────────────────────────────────
const getKontakDarurat = async (req, res) => {
  try {
    const data = await prisma.kontakDarurat.findMany({ where: { aktif: true } });
    return response.success(res, data);
  } catch (err) { return response.error(res); }
};

const tambahKontakDarurat = async (req, res) => {
  try {
    const { jenis, nama, nomor } = req.body;
    if (!jenis || !nama || !nomor) return response.error(res, "Semua field wajib diisi", 400);
    const data = await prisma.kontakDarurat.create({ data: { jenis, nama, nomor } });
    return response.created(res, data);
  } catch (err) { return response.error(res); }
};

const updateKontakDarurat = async (req, res) => {
  try {
    const { jenis, nama, nomor, aktif } = req.body;
    const data = await prisma.kontakDarurat.update({
      where: { id: req.params.id },
      data: { jenis, nama, nomor, aktif },
    });
    return response.success(res, data, "Kontak darurat diperbarui");
  } catch (err) { return response.error(res); }
};

// ─── Pemberitahuan (carousel / broadcast) ────────────────────────────────────
const { broadcastNotifikasi } = require("../utils/notification");

const getPemberitahuan = async (req, res) => {
  try {
    const data = await prisma.pemberitahuan.findMany({
      where: { aktif: true },
      orderBy: { createdAt: "desc" },
    });
    return response.success(res, data);
  } catch (err) { return response.error(res); }
};

const getAllPemberitahuan = async (req, res) => {
  try {
    const data = await prisma.pemberitahuan.findMany({ orderBy: { createdAt: "desc" } });
    return response.success(res, data);
  } catch (err) { return response.error(res); }
};

const buatPemberitahuan = async (req, res) => {
  try {
    const { judul, isi, jenis } = req.body;
    if (!judul || !isi || !jenis) return response.error(res, "Judul, isi, dan jenis wajib diisi", 400);
    const foto = req.file ? req.file.path : null;

    const data = await prisma.pemberitahuan.create({ data: { judul, isi, jenis, foto } });

    // Broadcast ke semua user
    await broadcastNotifikasi(judul, isi, data.id);

    return response.created(res, data, "Pemberitahuan dibuat dan dikirim ke semua warga");
  } catch (err) { return response.error(res, "Gagal buat pemberitahuan"); }
};

const updatePemberitahuan = async (req, res) => {
  try {
    const { judul, isi, jenis, aktif } = req.body;
    const foto = req.file ? req.file.path : undefined;
    const data = await prisma.pemberitahuan.update({
      where: { id: req.params.id },
      data: { judul, isi, jenis, aktif, ...(foto && { foto }) },
    });
    return response.success(res, data, "Pemberitahuan diperbarui");
  } catch (err) { return response.error(res); }
};

const hapusPemberitahuan = async (req, res) => {
  try {
    await prisma.pemberitahuan.delete({ where: { id: req.params.id } });
    return response.success(res, null, "Pemberitahuan dihapus");
  } catch (err) { return response.error(res); }
};

module.exports = {
  // Harga Pangan
  getHargaPangan, tambahHarga, updateHarga, hapusHarga,
  // Tempat
  getTempat, getDetailTempat, tambahTempat, updateTempat, hapusTempat,
  // Darurat
  getKontakDarurat, tambahKontakDarurat, updateKontakDarurat,
  // Pemberitahuan
  getPemberitahuan, getAllPemberitahuan, buatPemberitahuan, updatePemberitahuan, hapusPemberitahuan,
};
