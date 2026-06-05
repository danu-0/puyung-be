const router = require("express").Router();
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { uploadSingle } = require("../middlewares/upload.middleware");
const {
  getProfil, updateProfil, gantiPassword, getAllUsers,
} = require("../controllers/user.controller");

router.get("/profil",         verifyToken, getProfil);
router.put("/profil",         verifyToken, uploadSingle("profil"), updateProfil);
router.put("/ganti-password", verifyToken, gantiPassword);
router.get("/",               verifyToken, isAdmin, getAllUsers);

module.exports = router;
