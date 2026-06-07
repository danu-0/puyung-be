require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const prisma = require("./db/prisma")

const app = express();

// ─── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder untuk uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",           require("./routes/auth.routes"));
app.use("/api/users",          require("./routes/user.routes"));
app.use("/api/pengaduan",      require("./routes/pengaduan.routes"));
app.use("/api/berita",         require("./routes/berita.routes"));
app.use("/api/darurat",        require("./routes/darurat.routes"));
app.use("/api/harga-pangan",   require("./routes/hargaPangan.routes"));
app.use("/api/tempat",         require("./routes/tempat.routes"));
app.use("/api/administrasi",   require("./routes/administrasi.routes"));
app.use("/api/notifikasi",     require("./routes/notifikasi.routes"));
app.use("/api/aktivitas",      require("./routes/aktivitas.routes"));
app.use("/api/pemberitahuan",  require("./routes/pemberitahuan.routes"));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Puyung Serve API is running 🏡", version: "1.0.0" });
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan" });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
  });
});

// Cleanup token blacklist yang sudah expired — jalankan setiap 24 jam
setInterval(async () => {
  const deleted = await prisma.tokenBlacklist.deleteMany({
    where: { expiredAt: { lt: new Date() } },
  });
  if (deleted.count > 0) {
    console.log(`🧹 Cleaned ${deleted.count} expired tokens from blacklist`);
  }
}, 24 * 60 * 60 * 1000);

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Puyung Serve API running on port ${PORT}`);
});
