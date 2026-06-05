const router = require("express").Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const { getAktivitas } = require("../controllers/user.controller");

router.get("/", verifyToken, getAktivitas);

module.exports = router;
