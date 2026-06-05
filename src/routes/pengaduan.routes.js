const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { uploadPengaduan } = require("../middlewares/upload.middleware");
const {
  buatPengaduan, getPengaduan, getDetailPengaduan, updateStatusPengaduan,
} = require("../controllers/pengaduan.controller");

router.post("/",              verifyToken, uploadPengaduan, buatPengaduan);
router.get("/",               verifyToken, getPengaduan);
router.get("/:id",            verifyToken, getDetailPengaduan);
router.put("/:id/status",     verifyToken, isAdmin, updateStatusPengaduan);

module.exports = router;
