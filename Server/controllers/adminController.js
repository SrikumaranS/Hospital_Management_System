const pool = require('../config/db');
const bcrypt = require('bcryptjs');

createUser = async (req, res) => {
  const { name, email, password, role, additionalInfo } = req.body;

  try {
    const validRoles = ['doctor', 'nurse', 'staff', 'pharmacy'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = await pool.query('SELECT 1 FROM users WHERE email=$1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, passwordHash, role]
    );
    const userId = result.rows[0].id;

    if (role === 'doctor') {
      await pool.query(
        'INSERT INTO doctors (user_id, specialization, dept_id) VALUES ($1, $2, $3)',
        [userId, additionalInfo?.specialization || null, additionalInfo?.dept_id || null]
      );
    } else if (role === 'nurse') {
      await pool.query('INSERT INTO nurses (user_id) VALUES ($1)', [userId]);
    } else if (role === 'staff') {
      await pool.query('INSERT INTO staff (user_id) VALUES ($1)', [userId]);
    } else if (role === 'pharmacy') {
        await pool.query('INSERT INTO pharmacy (user_id) VALUES ($1)',[userId]);
    }


    res.status(201).json({ message: `${role} user created successfully`, userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

getUserRole = async (req, res) => {
  try {
    const role = req.params.role;
    const validRoles = ['doctor', 'nurse', 'staff', 'pharmacy'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    let result;
    if (role === 'doctor') {
      result = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, d.specialization
         FROM users u
         JOIN doctors d ON u.id = d.user_id
         WHERE u.role = $1`,
        [role]
      );
    } else {
      result = await pool.query(
        `SELECT id, name, email, role FROM users WHERE role = $1`,
        [role]
      );
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password } = req.body;

    if (email) {
      const emailCheck = await pool.query('SELECT 1 FROM users WHERE email=$1 AND id<>$2', [email, userId]);
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    let passwordHash;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    await pool.query(
      `UPDATE users SET 
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      password_hash = COALESCE($3, password_hash)
      WHERE id = $4`,
      [name, email, passwordHash, userId]
    );
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query('DELETE FROM users WHERE id=$1', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createUser,
  getUserRole,
  updateUser,
  deleteUser
};
