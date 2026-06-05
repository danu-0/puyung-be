const jwt = require("jsonwebtoken");

// Verifikasi token JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: "Token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: "Token tidak valid atau sudah kadaluarsa" });
  }
};

// Hanya admin (OPERATOR atau KEPALA_DESA)
const isAdmin = (req, res, next) => {
  if (req.user.role !== "OPERATOR" && req.user.role !== "KEPALA_DESA") {
    return res.status(403).json({ success: false, message: "Akses ditolak. Hanya untuk admin desa" });
  }
  next();
};

// Hanya KEPALA_DESA
const isKepalaDesa = (req, res, next) => {
  if (req.user.role !== "KEPALA_DESA") {
    return res.status(403).json({ success: false, message: "Akses ditolak. Hanya untuk kepala desa" });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isKepalaDesa };
