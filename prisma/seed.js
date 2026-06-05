// prisma/seed.js
// Jalankan: node prisma/seed.js

require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database Puyung Serve...");

  // ─── Admin accounts ────────────────────────────────────────────────────────
  const adminAccounts = [
    { nomorHp: "081000000001", nama: "Kepala Desa Puyung", role: "KEPALA_DESA", password: "admin123" },
    { nomorHp: "081000000002", nama: "Operator Desa",      role: "OPERATOR",    password: "operator123" },
  ];

  for (const acc of adminAccounts) {
    const hashed = await bcrypt.hash(acc.password, 10);
    await prisma.user.upsert({
      where: { nomorHp: acc.nomorHp },
      update: {},
      create: { nomorHp: acc.nomorHp, nama: acc.nama, role: acc.role, password: hashed },
    });
    console.log(`✅ Admin: ${acc.nama} (${acc.nomorHp}) - pass: ${acc.password}`);
  }

  // ─── Kontak Darurat ─────────────────────────────────────────────────────────
  const kontakDarurat = [
    { jenis: "POLISI",  nama: "Polsek Jonggat",  nomor: "0370-651110" },
    { jenis: "AMBULAN", nama: "Puskesmas Puyung", nomor: "0370-651234" },
    { jenis: "DAMKAR",  nama: "Damkar Loteng",    nomor: "113" },
  ];

  for (const k of kontakDarurat) {
    await prisma.kontakDarurat.upsert({
      where: { id: k.jenis.toLowerCase() + "-seed" },
      update: {},
      create: { id: k.jenis.toLowerCase() + "-seed", ...k },
    });
  }
  console.log("✅ Kontak darurat berhasil ditambahkan");

  // ─── Harga Pangan awal ──────────────────────────────────────────────────────
  const hargaPangan = [
    { namaBarang: "Beras Medium",   harga: 13000, satuan: "kg" },
    { namaBarang: "Beras Premium",  harga: 15000, satuan: "kg" },
    { namaBarang: "Minyak Goreng",  harga: 14000, satuan: "liter" },
    { namaBarang: "Gula Pasir",     harga: 16000, satuan: "kg" },
    { namaBarang: "Telur Ayam",     harga: 28000, satuan: "kg" },
    { namaBarang: "Cabai Merah",    harga: 35000, satuan: "kg" },
    { namaBarang: "Bawang Merah",   harga: 30000, satuan: "kg" },
    { namaBarang: "Bawang Putih",   harga: 25000, satuan: "kg" },
    { namaBarang: "Tepung Terigu",  harga: 10000, satuan: "kg" },
    { namaBarang: "Daging Ayam",    harga: 35000, satuan: "kg" },
  ];

  await prisma.hargaPangan.createMany({ data: hargaPangan, skipDuplicates: true });
  console.log("✅ Harga pangan awal berhasil ditambahkan");

  // ─── Tempat vital ───────────────────────────────────────────────────────────
  const tempat = [
    { nama: "Kantor Desa Puyung", kategori: "kantor", alamat: "Jl. Raya Puyung No.1", latitude: -8.7123, longitude: 116.2456 },
    { nama: "Puskesmas Puyung",   kategori: "kesehatan", alamat: "Jl. Kesehatan Puyung", latitude: -8.7145, longitude: 116.2478 },
    { nama: "Pasar Puyung",       kategori: "pasar", alamat: "Jl. Pasar Puyung", latitude: -8.7100, longitude: 116.2430 },
    { nama: "SDN 1 Puyung",       kategori: "pendidikan", alamat: "Jl. Pendidikan Puyung", latitude: -8.7160, longitude: 116.2490 },
    { nama: "Masjid Al-Ikhlas",   kategori: "ibadah", alamat: "Jl. Masjid Puyung", latitude: -8.7130, longitude: 116.2440 },
  ];

  await prisma.tempat.createMany({ data: tempat, skipDuplicates: true });
  console.log("✅ Tempat vital berhasil ditambahkan");

  console.log("\n🎉 Seeding selesai!");
  console.log("─────────────────────────────────────────");
  console.log("Login Admin: HP 081000000001 / admin123");
  console.log("Login Operator: HP 081000000002 / operator123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
