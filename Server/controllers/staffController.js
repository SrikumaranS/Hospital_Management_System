// controllers/staffController.js
const pool = require('../config/db');

// Assign bed and nurse after checking patients and availability
exports.assignBedAndNurse = async (req, res) => {
  const { patient_mobile, bed_id, nurse_id } = req.body;
  const staff_user_id = req.user.userId;

  // Find patient ID from mobile
const patientRes = await pool.query(
  `SELECT id, user_id FROM patients WHERE contact = $1`,
  [patient_mobile]
);



  if (!patientRes.rows.length) return res.status(404).json({ error: "Patient not found" });
  const patient_id = patientRes.rows[0].id;

  // Find recent admission without bed assigned
  const admissionRes = await pool.query(
    `SELECT * FROM admissions WHERE patient_id = $1 AND bed_id IS NULL ORDER BY admit_time DESC LIMIT 1`,
    [patient_id]
  );
  if (!admissionRes.rows.length) return res.status(404).json({ error: "No admission requiring bed" });
  const admission_id = admissionRes.rows[0].id;

  // Check bed availability
  const bedRes = await pool.query(
    `SELECT * FROM beds WHERE id = $1 AND status = 'available'`,
    [bed_id]
  );
  if (!bedRes.rows.length) return res.status(400).json({ error: "Bed not available" });

  // Check nurse patient load
  const nurseLoad = await pool.query(
    `SELECT COUNT(*) FROM admissions WHERE nurse_id = $1 AND discharge_time IS NULL`,
    [nurse_id]
  );
  if (parseInt(nurseLoad.rows[0].count) >= 5) {
    return res.status(400).json({ error: "Nurse is at maximum capacity" });
  }

  // Assign bed and nurse
  await pool.query(`UPDATE beds SET status = 'occupied', updated_by = $1 WHERE id = $2`,
    [patientRes.rows[0].user_id, bed_id]);
  await pool.query(
    `UPDATE admissions SET bed_id = $1, nurse_id = $2, bed_assigned_time = NOW(), admitted_by = $3 WHERE id = $4`,
    [bed_id, nurse_id, staff_user_id, admission_id]
  );

  res.json({ message: "Bed and nurse assigned successfully", admission_id });
};

// Patient Discharge
exports.dischargePatient = async (req, res) => {
  const { admission_id } = req.body;
  const staff_user_id = req.user.userId;

  // Get admission and bed id
  const admRes = await pool.query(`SELECT * FROM admissions WHERE id = $1`, [admission_id]);
  if (!admRes.rows.length) return res.status(404).json({ error: "Admission not found" });
  const bed_id = admRes.rows[0].bed_id;

  // Update admission discharge and set bed to cleaning
  await pool.query(
    `UPDATE admissions SET discharge_time = NOW(), discharged_by = $1 WHERE id = $2`,
    [staff_user_id, admission_id]
  );
  await pool.query(
    `UPDATE beds SET status = 'cleaning', updated_by = NULL WHERE id = $1`,
    [bed_id]
  );

  res.json({ message: "Patient discharged and bed marked for cleaning" });
};
