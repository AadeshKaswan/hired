const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  candidateName: String,
  email: String,
  phone: String,
  skills: [String],
  education: [String],
  experience: [String],
  projects: [String],
  certifications: [String],
  atsScore: Number,
  strengths: [String],
  weaknesses: [String],
  missingSkills: [String],
  improvements: [String],
  recommendedRoles: [String],
  summary: String,
}, { timestamps: true });

module.exports = mongoose.model('ResumeAnalysis', analysisSchema);