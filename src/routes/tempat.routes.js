const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { uploadSingle } = require("../middlewares/upload.middleware");
const { getTempat, getDetailTempat, tambahTempat, updateTempat, hapusTempat } = require("../controllers/misc.controller");

router.get("/",       verifyToken, getTempat);
router.get("/:id",    verifyToken, getDetailTempat);
router.post("/",      verifyToken, isAdmin, uploadSingle("tempat"), tambahTempat);
router.put("/:id",    verifyToken, isAdmin, uploadSingle("tempat"), updateTempat);
router.delete("/:id", verifyToken, isAdmin, hapusTempat);

module.exports = router;
