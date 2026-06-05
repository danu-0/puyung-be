const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { uploadAdministrasi } = require("../middlewares/upload.middleware");
const {
  ajukanAdministrasi, getAdministrasi, getDetailAdministrasi, updateStatusAdministrasi,
} = require("../controllers/administrasi.controller");

router.post("/",            verifyToken, uploadAdministrasi, ajukanAdministrasi);
router.get("/",             verifyToken, getAdministrasi);
router.get("/:id",          verifyToken, getDetailAdministrasi);
router.put("/:id/status",   verifyToken, isAdmin, updateStatusAdministrasi);

module.exports = router;
