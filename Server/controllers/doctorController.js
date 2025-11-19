// controllers/doctorController.js
const pool = require('../config/db');

// View today's patients in queue
const viewQueue = async (req, res) => {
  try {
    const doctor_user_id = req.user.userId;

    // Get doctor profile ID
    const docRes = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [doctor_user_id]
    );
    if (!docRes.rows.length) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }
    const doctor_id = docRes.rows[0].id;

    // Fetch today’s appointments in queue
    const queueRes = await pool.query(
      `SELECT a.id AS appointment_id, p.name AS patient_name, a.token_number,
              a.appointment_time, a.status
       FROM appointments a
       JOIN patients pa ON a.patient_id = pa.id
       JOIN users p ON pa.user_id = p.id
       WHERE a.doctor_id = $1 AND DATE(a.appointment_time) >= CURRENT_DATE
       AND a.status IN ('pending', 'admitted', 'leave')
       ORDER BY a.token_number ASC, a.appointment_time ASC`,
      [doctor_id]
    );

    res.json(queueRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
  try {
    const doctor_user_id = req.user.userId;
    const { appointment_id, status } = req.body;
    const validStatus = ['pending', 'admitted', 'leave'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Get doctor profile ID
    const docRes = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [doctor_user_id]
    );
    if (!docRes.rows.length) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }
    const doctor_id = docRes.rows[0].id;

    // Update status
    const updateRes = await pool.query(
      'UPDATE appointments SET status = $1 WHERE id = $2 AND doctor_id = $3 RETURNING id, status, patient_id',
      [status, appointment_id, doctor_id]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ error: 'Appointment not found or not authorized' });
    }

    res.json({ message: 'Appointment status updated', appointment: updateRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create prescription (linked to appointment and doctor)
const createPrescription = async (req, res) => {
  try {
    const doctor_user_id = req.user.userId;
    const { appointment_id, patient_id, notes, medicines, prescription_status } = req.body;

    // Get doctor profile ID
    const docRes = await pool.query(
      'SELECT id FROM doctors WHERE user_id = $1',
      [doctor_user_id]
    );
    if (!docRes.rows.length) {
      return res.status(400).json({ error: 'Doctor profile not found' });
    }
    const doctor_id = docRes.rows[0].id;

    // Verify appointment ownership
    const appRes = await pool.query(
      'SELECT * FROM appointments WHERE id = $1 AND doctor_id = $2',
      [appointment_id, doctor_id]
    );
    if (!appRes.rows.length) {
      return res.status(404).json({ error: 'Appointment not found or unauthorized' });
    }

    // Insert prescription
    const presRes = await pool.query(
      `INSERT INTO prescriptions
        (patient_id, doctor_id, appointment_id, notes, medicines)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [patient_id, doctor_id, appointment_id, notes, medicines]
    );

    res.status(201).json({ message: 'Prescription created', prescription: presRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { viewQueue, updateAppointmentStatus, createPrescription };
