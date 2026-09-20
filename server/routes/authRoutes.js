const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Security: Disallow self-assignment of the admin role
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin registration is not permitted through public sign-up' });
    }

    const safeRole = role === 'employer' ? 'employer' : 'jobseeker';
    const user = await User.create({ name, email, password, role: safeRole });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: signToken(user._id, user.role)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: signToken(user._id, user.role)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;