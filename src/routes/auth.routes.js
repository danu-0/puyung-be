// src/routes/auth.routes.js
const router = require("express").Router();
const { register, login, getMe, logout } = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);
router.post('/logout', verifyToken, logout)

module.exports = router;
