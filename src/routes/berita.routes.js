const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { uploadSingle } = require("../middlewares/upload.middleware");
const { getBerita, getDetailBerita, buatBerita, editBerita, hapusBerita } = require("../controllers/berita.controller");

router.get("/",       verifyToken, getBerita);
router.get("/:id",    verifyToken, getDetailBerita);
router.post("/",      verifyToken, isAdmin, uploadSingle("berita"), buatBerita);
router.put("/:id",    verifyToken, isAdmin, uploadSingle("berita"), editBerita);
router.delete("/:id", verifyToken, isAdmin, hapusBerita);

module.exports = router;
