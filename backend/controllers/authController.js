const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret_rentmate_key_123', {
    expiresIn: '30d',
  });
};

// Mock database for fallback
const mockUsers = [];
exports.mockUsers = mockUsers;

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Fallback if MongoDB is not connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.warn("Using mock DB for registration");
      const userExists = mockUsers.find(u => u.email === email);
      if (userExists) return res.status(400).json({ message: 'User already exists' });
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newUser = { _id: Date.now().toString(), name, email, password: hashedPassword, role: role || 'tenant' };
      mockUsers.push(newUser);
      
      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id, newUser.role),
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'tenant'
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Fallback if MongoDB is not connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      console.warn("Using mock DB for login");
      const user = mockUsers.find(u => u.email === email);
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      const user = mockUsers.find(u => u._id === req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const { password, ...userWithoutPassword } = user;
      return res.json({ ...userWithoutPassword, savedProperties: [] });
    }

    const user = await User.findById(req.user.id).select('-password').populate('savedProperties');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
