const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getRole } = require('../utils/roleHelper');

const loginEmployee = async (req, res) => {
    const { email, password } = req.body;
    try {
        const role = getRole(email);
        if (!role) return res.status(400).json({error: 'Invalid Role'});

        const userRes = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
        const user = userRes.rows[0];
        if (!user || user.role !== role)
            return res.status(400).json({error: 'Invalid email or role'});

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch)
            return res.status(400).json({error: 'Invalid password'});

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                name: user.name,
                email: user.email
            },
            process.env.JWT_SECRET, { expiresIn: '8h' }
        );
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({error: err.message});
    }
};

module.exports = loginEmployee;
