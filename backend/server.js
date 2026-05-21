const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://rentmate-kappa.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// Database Connection
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/rentmate';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.warn('\n--- MongoDB Connection Warning ---');
    console.warn('Could not connect to MongoDB. Using in-memory fallback for Auth APIs.');
    console.warn('To use a real database, ensure MongoDB is running or add MONGO_URI to .env');
    console.warn('----------------------------------\n');
  }

  // Start server regardless of DB connection so API calls don't get ECONNREFUSED
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/visits', require('./routes/visitRoutes'));

// Serve local uploads
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
  res.send('RentMate API is running...');
});
