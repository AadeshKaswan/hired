const express = require('express');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Job Seeker: Apply to a job
router.post('/:jobId', protect, authorize('jobseeker'), upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if already applied
    const exists = await Application.findOne({ job: job._id, applicant: req.user._id });
    if (exists) return res.status(400).json({ message: 'Already applied' });

    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      resume: req.file ? `uploads/resumes/${req.file.filename}` : req.user.resume, // use uploaded or profile resume
      coverLetter: req.body.coverLetter
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Job Seeker: My applications
router.get('/myapps', protect, authorize('jobseeker'), async (req, res) => {
  const apps = await Application.find({ applicant: req.user._id })
    .populate('job', 'title company location');
  res.json(apps);
});

// Employer: View applicants for a specific job
router.get('/job/:jobId/applicants', protect, authorize('employer'), async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job || job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const applicants = await Application.find({ job: req.params.jobId })
    .populate('applicant', 'name email skills experience resume');
  res.json(applicants);
});

// Employer: Update application status
router.put('/:appId/status', protect, authorize('employer'), async (req, res) => {
  const { status } = req.body;
  const app = await Application.findById(req.params.appId).populate('job');
  if (!app || app.job.postedBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  app.status = status;
  await app.save();
  res.json(app);
});

module.exports = router;