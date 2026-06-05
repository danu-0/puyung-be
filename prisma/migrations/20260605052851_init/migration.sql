-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PENDUDUK', 'PENDATANG', 'OPERATOR', 'KEPALA_DESA');

-- CreateEnum
CREATE TYPE "StatusLaporan" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "StatusAdministrasi" AS ENUM ('MENUNGGU', 'DIPROSES', 'SELESAI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "JenisAdministrasi" AS ENUM ('KTP', 'KK', 'SURAT_NIKAH', 'AKTA_KELAHIRAN', 'BANSOS');

-- CreateEnum
CREATE TYPE "JenisPemberitahuan" AS ENUM ('ACARA', 'PEMADAMAN_LISTRIK', 'BENCANA_ALAM', 'KERUSAKAN', 'ANGIN_KENCANG', 'LAINNYA');

-- CreateEnum
CREATE TYPE "JenisDarurat" AS ENUM ('POLISI', 'AMBULAN', 'DAMKAR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nomorHp" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PENDUDUK',
    "foto" TEXT,
    "alamat" TEXT,
    "nik" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengaduan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "waktu" TIMESTAMP(3) NOT NULL,
    "foto" TEXT[],
    "status" "StatusLaporan" NOT NULL DEFAULT 'MENUNGGU',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengaduan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berita" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "foto" TEXT,
    "penulis" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harga_pangan" (
    "id" TEXT NOT NULL,
    "namaBarang" TEXT NOT NULL,
    "harga" DOUBLE PRECISION NOT NULL,
    "satuan" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "harga_pangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tempat" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "kategori" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "foto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tempat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administrasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jenis" "JenisAdministrasi" NOT NULL,
    "status" "StatusAdministrasi" NOT NULL DEFAULT 'MENUNGGU',
    "dataDiri" JSONB NOT NULL,
    "dokumen" TEXT[],
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "referensiId" TEXT,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aktivitas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "referensiId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "aktivitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pemberitahuan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "jenis" "JenisPemberitahuan" NOT NULL,
    "foto" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pemberitahuan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kontak_darurat" (
    "id" TEXT NOT NULL,
    "jenis" "JenisDarurat" NOT NULL,
    "nama" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kontak_darurat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nomorHp_key" ON "users"("nomorHp");

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- AddForeignKey
ALTER TABLE "pengaduan" ADD CONSTRAINT "pengaduan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administrasi" ADD CONSTRAINT "administrasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aktivitas" ADD CONSTRAINT "aktivitas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
