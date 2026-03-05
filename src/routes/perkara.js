const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/authMiddleware");

// GET semua perkara (publik)
router.get("/", async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = "SELECT * FROM perkara WHERE 1=1";
    const params = [];
    if (search) {
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      query += ` AND (no_perkara LIKE ? OR penggugat LIKE ? OR tergugat LIKE ?)`;
    }
    if (status && status !== "Semua") {
      params.push(status);
      query += ` AND status = ?`;
    }
    query += " ORDER BY created_at DESC";
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Kesalahan server." });
  }
});

// POST tambah perkara (admin)
router.post("/", auth, async (req, res) => {
  const { no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO perkara (no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar],
    );
    const [rows] = await pool.query("SELECT * FROM perkara WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ success: false, message: "Nomor perkara sudah ada." });
    res.status(500).json({ success: false, message: "Kesalahan server." });
  }
});

// PUT edit perkara (admin)
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE perkara SET no_perkara=?, penggugat=?, tergugat=?, obyek_sengketa=?,
       tahap_persiapan=?, putusan_pertama=?, putusan_banding=?, putusan_kasasi=?,
       putusan_pk=?, status=?, tgl_daftar=?, updated_at=NOW()
       WHERE id=?`,
      [no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar, id],
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    const [rows] = await pool.query("SELECT * FROM perkara WHERE id = ?", [id]);
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ success: false, message: "Nomor perkara sudah ada." });
    res.status(500).json({ success: false, message: "Kesalahan server." });
  }
});

// DELETE hapus perkara (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM perkara WHERE id=?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    res.json({ success: true, message: "Perkara berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Kesalahan server." });
  }
});

module.exports = router;
