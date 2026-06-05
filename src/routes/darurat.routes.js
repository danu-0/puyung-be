// ──────────────────────────────────────────────
// src/routes/darurat.routes.js
// ──────────────────────────────────────────────
const router1 = require("express").Router();
const { verifyToken, isAdmin } = require("../middlewares/auth.middleware");
const { getKontakDarurat, tambahKontakDarurat, updateKontakDarurat } = require("../controllers/misc.controller");

router1.get("/",       verifyToken, getKontakDarurat);
router1.post("/",      verifyToken, isAdmin, tambahKontakDarurat);
router1.put("/:id",    verifyToken, isAdmin, updateKontakDarurat);

module.exports = router1;
