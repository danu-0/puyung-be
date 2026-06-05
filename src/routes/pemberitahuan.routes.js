const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { uploadSingle } = require("../middlewares/upload.middleware");
const {
  getPemberitahuan, getAllPemberitahuan, buatPemberitahuan, updatePemberitahuan, hapusPemberitahuan,
} = require("../controllers/misc.controller");

// User: hanya yang aktif (untuk carousel)
router.get("/",       verifyToken, getPemberitahuan);

// Admin
router.get("/semua",      verifyToken, isAdmin, getAllPemberitahuan);
router.post("/",          verifyToken, isAdmin, uploadSingle("pemberitahuan"), buatPemberitahuan);
router.put("/:id",        verifyToken, isAdmin, uploadSingle("pemberitahuan"), updatePemberitahuan);
router.delete("/:id",     verifyToken, isAdmin, hapusPemberitahuan);

module.exports = router;
