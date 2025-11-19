const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerPatient = async (req, res) =>{
    const { name, email, password, dob, gender, address, contact} = req.body;

    try{
        const existPatient = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
        if(existPatient.rows.length > 0){
            return res.status(400).json({error : 'Email already Exist'});
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const userResult = await pool.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, email, password_hash, 'patient']
        );
        const userId = userResult.rows[0].id;

        await pool.query(
            'INSERT INTO patients (user_id, dob, gender, address, contact) VALUES ($1, $2, $3, $4, $5)',
            [userId, dob, gender, address, contact]
        );

        res.status(201).json({message: 'Patient registered successfully'});

    }
    
    catch(err){
        res.status(500).json({error: err.message});
    }
};

const loginPatient = async (req, res) => {
    const {email, password} = req.body;

    try{
        const userResult = await pool.query('SELECT * FROM users WHERE email=$1', [email]);

        const user = userResult.rows[0];
        
        if(!user){
            return res.status(400).json({error: 'Invalid credentials'});
        }

        if(user.role !== 'patient'){
            return res.status(400).json({error: 'Invalid Role'});
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch){
            return res.status(400).json({ error: 'Invalid Password'});
        }

        const token = jwt.sign(
            {
                userId: user.id, role: user.role, name: user.name, email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        );

        res.json({ token, user: {id: user.id, name: user.name, email: user.email, role: user.role}});

    }

    catch(err){
        res.status(500).json({ error: err.message});
    }
};

getPrescriptions = async (req, res) => {
  try {
    const patient_user_id = req.user.userId;
    
    // Find the patient's profile ID
    const patientRes = await pool.query(
      'SELECT id FROM patients WHERE user_id = $1',
      [patient_user_id]
    );
    if (!patientRes.rows.length) {
      return res.status(404).json({ error: "Patient profile not found" });
    }
    const patient_id = patientRes.rows[0].id;

    // Fetch prescriptions with doctor info
    const presRes = await pool.query(
      `SELECT pr.id, pr.notes, pr.medicines, pr.created_at,
              d.specialization, u.name AS doctor_name,
              pr.appointment_id
       FROM prescriptions pr
       JOIN doctors d ON pr.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE pr.patient_id = $1
       ORDER BY pr.created_at DESC`,
      [patient_id]
    );
    res.json(presRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {registerPatient, loginPatient, getPrescriptions};
