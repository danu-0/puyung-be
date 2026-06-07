const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../db/prisma");
const response = require("../utils/response");

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { nomorHp, nama, password, role } = req.body;

    if (!nomorHp || !nama || !password) {
      return response.error(res, "Nomor HP, nama, dan password wajib diisi", 400);
    }

    const exists = await prisma.user.findUnique({ where: { nomorHp } });
    if (exists) return response.error(res, "Nomor HP sudah terdaftar", 409);

    // Validasi role hanya PENDUDUK atau PENDATANG (admin dibuat manual)
    const allowedRole = ["PENDUDUK", "PENDATANG"];
    const userRole = allowedRole.includes(role) ? role : "PENDUDUK";

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { nomorHp, nama, password: hashed, role: userRole },
      select: { id: true, nomorHp: true, nama: true, role: true, createdAt: true },
    });

    return response.created(res, user, "Registrasi berhasil. Silakan login");
  } catch (err) {
    console.error(err);
    return response.error(res, "Gagal registrasi");
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { nomorHp, password } = req.body;

    if (!nomorHp || !password) {
      return response.error(res, "Nomor HP dan password wajib diisi", 400);
    }

    const user = await prisma.user.findUnique({ where: { nomorHp } });
    if (!user) return response.error(res, "Nomor HP tidak terdaftar", 404);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return response.error(res, "Password salah", 401);

    const token = jwt.sign(
      { id: user.id, nomorHp: user.nomorHp, nama: user.nama, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return response.success(res, {
      token,
      user: { id: user.id, nama: user.nama, nomorHp: user.nomorHp, role: user.role },
    }, "Login berhasil");
  } catch (err) {
    console.error(err);
    return response.error(res, "Gagal login");
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nomorHp: true, nama: true, role: true, foto: true, alamat: true, nik: true, createdAt: true },
    });
    if (!user) return response.error(res, "User tidak ditemukan", 404);
    return response.success(res, user);
  } catch (err) {
    return response.error(res);
  }
};

const logout = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return response.error(res, "Token tidak ditemukan", 400);
    }

    // Decode tanpa verify untuk ambil waktu expired-nya
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return response.error(res, "Token tidak valid", 400);
    }

    const expiredAt = new Date(decoded.exp * 1000); // exp dalam detik → ms

    // Masukkan token ke blacklist
    await prisma.tokenBlacklist.create({
      data: { token, expiredAt },
    });

    return response.success(res, null, "Logout berhasil");
  } catch (err) {
    // Jika token sudah ada di blacklist (unique constraint)
    if (err.code === "P2002") {
      return response.success(res, null, "Logout berhasil");
    }
    console.error(err);
    return response.error(res, "Gagal logout");
  }
};

module.exports = { register, login, getMe, logout };
