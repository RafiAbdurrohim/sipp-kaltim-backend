const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ success: false, message: "Username dan password wajib diisi." });
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (!result.rows.length) return res.status(401).json({ success: false, message: "Username atau password salah." });
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Username atau password salah." });
    const token = jwt.sign({ id: user.id, username: user.username, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.json({ success: true, token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Kesalahan server." });
  }
});

router.get("/me", auth, (req, res) => res.json({ success: true, user: req.user }));

module.exports = router;
