require('dotenv').config();
const express = require('express');
const pool = require('./config/db');
const cors = require('cors');

const app = express();

app.use(cors());

app.use((req, res, next) => {
  if ((req.method === "DELETE" || req.method === "GET") && !req.headers['content-length']) {
    return next();
  }
  next();
});
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    express.json()(req, res, next);
  } else {
    next();
  }
});


pool.connect((err, client, release) => {
  if(err){
    return console.error("Error connecting to pgsql: ", err.stack);
  }
  console.log("Connected");
  release();
});

app.get('/',(req,res) => {
  res.send('Connected To DB and check console');
});

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const adminRoutes = require('./routes/admin');
app.use('/admin', adminRoutes);

const patientRoutes = require('./routes/patient.js');
app.use('/patient', patientRoutes);

const doctorRoutes = require('./routes/doctor');
app.use('/doctor', doctorRoutes);

const staffRoutes = require('./routes/staff');
app.use('/staff', staffRoutes);

const nurseRoutes = require('./routes/nurse');
app.use('/nurse', nurseRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
