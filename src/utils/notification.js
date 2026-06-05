const prisma = require("../db/prisma");

/**
 * Membuat notifikasi untuk user tertentu
 * @param {string} userId
 * @param {string} judul
 * @param {string} pesan
 * @param {string} tipe - pengaduan | administrasi | pemberitahuan
 * @param {string|null} referensiId
 */
const kirimNotifikasi = async (userId, judul, pesan, tipe, referensiId = null) => {
  try {
    await prisma.notifikasi.create({
      data: { userId, judul, pesan, tipe, referensiId },
    });
  } catch (err) {
    console.error("Gagal kirim notifikasi:", err.message);
  }
};

/**
 * Kirim notifikasi ke semua user (broadcast - untuk pemberitahuan desa)
 */
const broadcastNotifikasi = async (judul, pesan, referensiId = null) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ["PENDUDUK", "PENDATANG"] } },
      select: { id: true },
    });

    const data = users.map((u) => ({
      userId: u.id,
      judul,
      pesan,
      tipe: "pemberitahuan",
      referensiId,
    }));

    await prisma.notifikasi.createMany({ data });
  } catch (err) {
    console.error("Gagal broadcast notifikasi:", err.message);
  }
};

/**
 * Buat/update aktivitas tracking
 */
const upsertAktivitas = async (userId, tipe, referensiId, judul, status) => {
  try {
    const existing = await prisma.aktivitas.findFirst({
      where: { userId, tipe, referensiId },
    });

    if (existing) {
      await prisma.aktivitas.update({
        where: { id: existing.id },
        data: { status, judul },
      });
    } else {
      await prisma.aktivitas.create({
        data: { userId, tipe, referensiId, judul, status },
      });
    }
  } catch (err) {
    console.error("Gagal upsert aktivitas:", err.message);
  }
};

module.exports = { kirimNotifikasi, broadcastNotifikasi, upsertAktivitas };
