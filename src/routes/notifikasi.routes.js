const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { getNotifikasi, bacaNotifikasi, bacaSemuaNotifikasi } = require("../controllers/user.controller");

router.get("/",              verifyToken, getNotifikasi);
router.put("/baca-semua",    verifyToken, bacaSemuaNotifikasi);
router.put("/:id/baca",      verifyToken, bacaNotifikasi);

module.exports = router;
