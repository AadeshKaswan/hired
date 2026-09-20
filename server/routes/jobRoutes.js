const express = require('express');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Public: Get all jobs (with search/filter)
router.get('/', async (req, res) => {
  const { keyword, location, type } = req.query;
  const filter = {};
  if (keyword) filter.title = { $regex: keyword, $options: 'i' };
  if (location) filter.location = { $regex: location, $options: 'i' };
  if (type) filter.type = type;

  const jobs = await Job.find(filter).populate('postedBy', 'name email').sort('-createdAt');
  res.json(jobs);
});

// Employer: Get own jobs (placed before /:id to avoid route shadowing)
router.get('/employer/myjobs', protect, authorize('employer'), async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Employer: Create a job
router.post('/', protect, authorize('employer'), async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  res.status(201).json(job);
});

// Employer: Update own job
router.put('/:id', protect, authorize('employer'), async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, postedBy: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });
  res.json(job);
});

// Employer: Delete own job
router.delete('/:id', protect, authorize('employer'), async (req, res) => {
  const job = await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
  if (!job) return res.status(404).json({ message: 'Job not found or not authorized' });
  res.json({ message: 'Job removed' });
});

module.exports = router;