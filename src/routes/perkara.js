const express = require('express')
const router = express.Router()
const pool = require('../db')
const auth = require('../middleware/authMiddleware')

// GET semua perkara (publik)
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query
    let query = 'SELECT * FROM perkara WHERE 1=1'
    const params = []
    if (search) {
      params.push(`%${search}%`)
      query += ` AND (no_tingkat_pertama ILIKE $${params.length} OR penggugat ILIKE $${params.length} OR tergugat ILIKE $${params.length})`
    }
    if (status && status !== 'Semua') {
      params.push(status)
      query += ` AND status = $${params.length}`
    }
    query += ' ORDER BY created_at DESC'
    const result = await pool.query(query, params)
    res.json({ success: true, data: result.rows, total: result.rows.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Kesalahan server.' })
  }
})

// POST tambah perkara (admin)
router.post('/', auth, async (req, res) => {
  const {
    no_tingkat_pertama, no_banding, no_kasasi, no_pk,
    penggugat, tergugat, obyek_sengketa,
    tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk,
    status, status_data, tgl_daftar,
    tgl_diajukan_pertama, tgl_diputuskan_pertama,
    tgl_diajukan_banding, tgl_diputuskan_banding,
    tgl_diajukan_kasasi, tgl_diputuskan_kasasi,
    tgl_diajukan_pk, tgl_diputuskan_pk,
    tgl_diajukan_inkracht, tgl_diputuskan_inkracht,
    ket_pertama, ket_banding, ket_kasasi, ket_pk
  } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO perkara (
        no_tingkat_pertama, no_banding, no_kasasi, no_pk,
        penggugat, tergugat, obyek_sengketa,
        tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk,
        status, status_data, tgl_daftar,
        tgl_diajukan_pertama, tgl_diputuskan_pertama,
        tgl_diajukan_banding, tgl_diputuskan_banding,
        tgl_diajukan_kasasi, tgl_diputuskan_kasasi,
        tgl_diajukan_pk, tgl_diputuskan_pk,
        tgl_diajukan_inkracht, tgl_diputuskan_inkracht,
        ket_pertama, ket_banding, ket_kasasi, ket_pk
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29
      ) RETURNING *`,
      [
        no_tingkat_pertama||null, no_banding||null, no_kasasi||null, no_pk||null,
        penggugat, tergugat, obyek_sengketa,
        tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk,
        status, status_data||'TUN', tgl_daftar,
        tgl_diajukan_pertama||null, tgl_diputuskan_pertama||null,
        tgl_diajukan_banding||null, tgl_diputuskan_banding||null,
        tgl_diajukan_kasasi||null, tgl_diputuskan_kasasi||null,
        tgl_diajukan_pk||null, tgl_diputuskan_pk||null,
        tgl_diajukan_inkracht||null, tgl_diputuskan_inkracht||null,
        ket_pertama||null, ket_banding||null, ket_kasasi||null, ket_pk||null
      ]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Kesalahan server.' })
  }
})

// PUT edit perkara (admin)
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params
  const {
    no_tingkat_pertama, no_banding, no_kasasi, no_pk,
    penggugat, tergugat, obyek_sengketa,
    tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk,
    status, status_data, tgl_daftar,
    tgl_diajukan_pertama, tgl_diputuskan_pertama,
    tgl_diajukan_banding, tgl_diputuskan_banding,
    tgl_diajukan_kasasi, tgl_diputuskan_kasasi,
    tgl_diajukan_pk, tgl_diputuskan_pk,
    tgl_diajukan_inkracht, tgl_diputuskan_inkracht,
    ket_pertama, ket_banding, ket_kasasi, ket_pk
  } = req.body
  try {
    const result = await pool.query(
      `UPDATE perkara SET
        no_tingkat_pertama=$1, no_banding=$2, no_kasasi=$3, no_pk=$4,
        penggugat=$5, tergugat=$6, obyek_sengketa=$7,
        tahap_persiapan=$8, putusan_pertama=$9, putusan_banding=$10,
        putusan_kasasi=$11, putusan_pk=$12, status=$13, status_data=$14,
        tgl_daftar=$15,
        tgl_diajukan_pertama=$16, tgl_diputuskan_pertama=$17,
        tgl_diajukan_banding=$18, tgl_diputuskan_banding=$19,
        tgl_diajukan_kasasi=$20, tgl_diputuskan_kasasi=$21,
        tgl_diajukan_pk=$22, tgl_diputuskan_pk=$23,
        tgl_diajukan_inkracht=$24, tgl_diputuskan_inkracht=$25,
        ket_pertama=$26, ket_banding=$27, ket_kasasi=$28, ket_pk=$29,
        updated_at=NOW()
      WHERE id=$30 RETURNING *`,
      [
        no_tingkat_pertama||null, no_banding||null, no_kasasi||null, no_pk||null,
        penggugat, tergugat, obyek_sengketa,
        tahap_persiapan, putusan_pertama, putusan_banding, putusan_kasasi, putusan_pk,
        status, status_data||'TUN', tgl_daftar,
        tgl_diajukan_pertama||null, tgl_diputuskan_pertama||null,
        tgl_diajukan_banding||null, tgl_diputuskan_banding||null,
        tgl_diajukan_kasasi||null, tgl_diputuskan_kasasi||null,
        tgl_diajukan_pk||null, tgl_diputuskan_pk||null,
        tgl_diajukan_inkracht||null, tgl_diputuskan_inkracht||null,
        ket_pertama||null, ket_banding||null, ket_kasasi||null, ket_pk||null,
        id
      ]
    )
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' })
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Kesalahan server.' })
  }
})

// DELETE hapus perkara (admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM perkara WHERE id=$1 RETURNING *', [req.params.id])
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Data tidak ditemukan.' })
    res.json({ success: true, message: 'Perkara berhasil dihapus.' })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Kesalahan server.' })
  }
})

module.exports = router