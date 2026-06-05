const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { getHargaPangan, tambahHarga, updateHarga, hapusHarga } = require("../controllers/misc.controller");

router.get("/",       verifyToken, getHargaPangan);
router.post("/",      verifyToken, isAdmin, tambahHarga);
router.put("/:id",    verifyToken, isAdmin, updateHarga);
router.delete("/:id", verifyToken, isAdmin, hapusHarga);

module.exports = router;
