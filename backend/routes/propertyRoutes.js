const express = require('express');
const router = express.Router();
const { 
  getProperties, 
  getPropertyById, 
  createProperty, 
  getMyProperties, 
  updateProperty, 
  getUnverifiedProperties, 
  verifyProperty,
  getAreas,
  deleteProperty,
  uploadImages
} = require('../controllers/propertyController');
const { auth, restrictTo } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Owner routes (must be BEFORE /:id to avoid being caught by the param route)
router.get('/owner/my-properties', auth, restrictTo('owner'), getMyProperties);

// Admin routes (must be BEFORE /:id)
router.get('/admin/unverified', auth, restrictTo('admin'), getUnverifiedProperties);
router.put('/admin/verify/:id', auth, restrictTo('admin'), verifyProperty);

// Public routes
router.get('/areas', getAreas);
router.get('/', getProperties);
router.post('/', auth, restrictTo('owner', 'admin'), createProperty);
router.post('/upload', auth, restrictTo('owner', 'admin'), upload.array('images', 5), uploadImages);

// Parameterized routes LAST
router.get('/:id', getPropertyById);
router.put('/:id', auth, restrictTo('owner', 'admin'), updateProperty);
router.delete('/:id', auth, restrictTo('owner', 'admin'), deleteProperty);

module.exports = router;
