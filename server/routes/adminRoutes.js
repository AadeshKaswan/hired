const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

// All admin routes protected
router.use(protect);
router.use(authorize('admin'));

// Stats
router.get('/stats', async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalJobs = await Job.countDocuments();
  const totalApplications = await Application.countDocuments();
  res.json({ totalUsers, totalJobs, totalApplications });
});

// Users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

router.delete('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// Jobs
router.get('/jobs', async (req, res) => {
  const jobs = await Job.find().populate('postedBy', 'name email');
  res.json(jobs);
});

router.delete('/jobs/:id', async (req, res) => {
  await Job.findByIdAndDelete(req.params.id);
  await Application.deleteMany({ job: req.params.id });
  res.json({ message: 'Job deleted' });
});

// Applications
router.get('/applications', async (req, res) => {
  const applications = await Application.find()
    .populate('applicant', 'name email')
    .populate('job', 'title company')
    .sort('-createdAt');
  res.json(applications);
});

router.put('/applications/:id', async (req, res) => {
  const { status } = req.body;
  const app = await Application.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );
  res.json(app);
});

module.exports = router;