const express = require('express');
const app = express();

const morgan = require('morgan');
const cors = require("cors");

app.use(morgan("dev"))
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminUserRoutes'));
app.use('/api/admin', require('./routes/adminVehicleRoutes'));
app.use('/api/admin', require('./routes/adminVehicleUsageRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/user', require('./routes/userVehicleUsageRoutes'));

app.get('/active', (req, res) => {
    res.json({ active: true });
});

module.exports = app;