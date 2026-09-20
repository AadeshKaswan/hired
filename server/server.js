// 1. Load .env file
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 2. Verify critical variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is missing from .env file');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is missing from .env file');
  process.exit(1);
}

// 3. Load modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const appRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 5. Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', appRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resume', require('./routes/resumeRoutes'));

// 6. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));