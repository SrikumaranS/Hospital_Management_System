// controllers/nurseController.js
const pool = require('../config/db');

// Mark cleaning done, bed available again
exports.markBedAvailable = async (req, res) => {
  const { bed_id } = req.body;

  const bedRes = await pool.query(`SELECT * FROM beds WHERE id = $1 AND status = 'cleaning'`, [bed_id]);
  if (!bedRes.rows.length) return res.status(400).json({ error: "Bed is not in cleaning status" });

  // Update bed to available
  await pool.query(`UPDATE beds SET status = 'available', updated_by = NULL WHERE id = $1`, [bed_id]);

  // Optionally update admission bed_cleaned_time for discharged patient with this bed
  await pool.query(
    `UPDATE admissions SET bed_cleaned_time = NOW()
     WHERE bed_id = $1 AND discharge_time IS NOT NULL AND bed_cleaned_time IS NULL`,
    [bed_id]
  );

  res.json({ message: "Bed marked as available" });
};
