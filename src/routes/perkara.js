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
      params.push(`%${search}%`);
      query += ` AND (no_perkara ILIKE $${params.length} OR penggugat ILIKE $${params.length} OR tergugat ILIKE $${params.length})`;
    }
    if (status && status !== "Semua") {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    query += " ORDER BY created_at DESC";
    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows, total: result.rows.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Kesalahan server." });
  }
});

// POST tambah perkara (admin)
router.post("/", auth, async (req, res) => {
  const { no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO perkara (no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar],
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(400).json({ success: false, message: "Nomor perkara sudah ada." });
    res.status(500).json({ success: false, message: "Kesalahan server." });
  }
});

// PUT edit perkara (admin)
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar } = req.body;
  try {
    const result = await pool.query(
      `UPDATE perkara SET no_perkara=$1, penggugat=$2, tergugat=$3, obyek_sengketa=$4,
       tahap_persiapan=$5, putusan_pertama=$6, putusan_banding=$7, putusan_kasasi=$8,
       putusan_pk=$9, status=$10, tgl_daftar=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [no_perkara, penggugat, tergugat, obyek_sengketa, tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk, status, tgl_daftar, id],
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Kesalahan server." });
  }
});

// DELETE hapus perkara (admin)
router.delete("/:id", auth, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM perkara WHERE id=$1 RETURNING *", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
    res.json({ success: true, message: "Perkara berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Kesalahan server." });
  }
});

module.exports = router;
