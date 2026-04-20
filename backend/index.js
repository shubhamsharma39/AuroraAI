const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'Backend is healthy' });
});

app.listen(PORT, () => {
    console.log(`Node.js Backend running on http://localhost:${PORT}`);
});
