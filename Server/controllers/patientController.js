// controllers/patientController.js
const pool = require('../config/db');

// Book Appointment API
bookAppointment = async (req, res) => {
    const { doctor_id, appointment_time, dept_id } = req.body;
    const patient_user_id = req.user.userId; // from JWT

    try {
        // Find patient profile ID
        const patientRes = await pool.query(
            'SELECT id FROM patients WHERE user_id=$1',
            [patient_user_id]
        );
        if (patientRes.rows.length === 0) {
            return res.status(400).json({ error: 'Patient profile not found' });
        }
        const patient_id = patientRes.rows[0].id;

        // Find next available token number for that doctor, date
        const date = appointment_time.split('T')[0]; // YYYY-MM-DD
        const queueRes = await pool.query(
            `SELECT MAX(token_number) as max_token
             FROM appointments
             WHERE doctor_id=$1 AND DATE(appointment_time)=$2`,
            [doctor_id, date]
        );
        const nextToken = (queueRes.rows[0].max_token || 0) + 1;

        // Create appointment
        const result = await pool.query(
            `INSERT INTO appointments
            (patient_id, doctor_id, dept_id, appointment_time, token_number, status, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, token_number, appointment_time, status`,
            [
                patient_id,
                doctor_id,
                dept_id,
                appointment_time,
                nextToken,
                'pending',
                patient_user_id
            ]
        );

        res.status(201).json({
            appointment_id: result.rows[0].id,
            token_number: result.rows[0].token_number,
            appointment_time: result.rows[0].appointment_time,
            status: result.rows[0].status,
            message: 'Appointment booked!'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// View Patient Appointments
viewAppointments = async (req, res) => {
    const patient_user_id = req.user.userId;

    try {
        const patientRes = await pool.query(
            'SELECT id FROM patients WHERE user_id=$1',
            [patient_user_id]
        );
        if (patientRes.rows.length === 0) {
            return res.status(400).json({ error: 'Patient profile not found' });
        }
        const patient_id = patientRes.rows[0].id;

        const result = await pool.query(
            `SELECT a.id, a.appointment_time, a.token_number, a.status, d.name as doctor_name, dep.name as department
             FROM appointments a
             JOIN doctors doc ON a.doctor_id = doc.id
             JOIN users d ON doc.user_id = d.id
             LEFT JOIN departments dep ON a.dept_id = dep.id
             WHERE a.patient_id = $1
             ORDER BY a.appointment_time, a.token_number`,
            [patient_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    bookAppointment,
    viewAppointments
}