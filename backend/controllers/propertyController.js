const Property = require('../models/Property');
const mongoose = require('mongoose');

// Mock database for fallback when MongoDB is not connected
const mockProperties = [];
exports.mockProperties = mockProperties;

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all unique areas (for autocomplete)
// @route   GET /api/properties/areas
// @access  Public
exports.getAreas = async (req, res) => {
  try {
    const { city } = req.query;
    
    const citySynonyms = {
      "bangalore": ["banglore", "bengaluru", "bangalor", "bngalore"],
      "hyderabad": ["hydrabad", "hyderbad", "hiderabad"],
      "mumbai": ["bombay"],
      "chennai": ["madras"],
      "pune": ["poona"],
      "electronic city": ["electroniccity", "electronic-city"],
      "navi mumbai": ["navimumbai", "new bombay"]
    };

    const expandTerm = (term) => {
      let expanded = [term];
      for (const [standard, synonyms] of Object.entries(citySynonyms)) {
        if (term === standard || synonyms.includes(term)) {
          expanded = [standard, ...synonyms];
          break;
        }
      }
      return expanded;
    };

    if (!isDBConnected()) {
      let results = [...mockProperties];
      if (city && city.trim()) {
        const searchTerms = city.trim().toLowerCase().split(/\s+/);
        results = results.filter(p => {
          return searchTerms.every(term => {
            const expanded = expandTerm(term);
            return expanded.some(t => p.city.toLowerCase().includes(t) || p.area.toLowerCase().includes(t));
          });
        });
      }
      const areas = [...new Set(results.map(p => p.area))];
      return res.json(areas);
    }

    let query = {};
    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    if (city && city.trim()) {
      const searchTerms = city.trim().toLowerCase().split(/\s+/);
      const andConditions = searchTerms.map(term => {
        const expandedTerms = expandTerm(term);
        const regexStr = expandedTerms.map(t => escapeRegex(t)).join('|');
        const termRegex = new RegExp(`(${regexStr})`, 'i');
        return {
          $or: [
            { city: termRegex },
            { area: termRegex }
          ]
        };
      });
      
      query.$and = andConditions;
    }

    const areas = await Property.distinct('area', query);
    res.json(areas);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all verified properties (for public/tenants)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const { city, area, bhkType, furnishing, minRent, maxRent, preference } = req.query;

    const citySynonyms = {
      "bangalore": ["banglore", "bengaluru", "bangalor", "bngalore"],
      "hyderabad": ["hydrabad", "hyderbad", "hiderabad"],
      "mumbai": ["bombay"],
      "chennai": ["madras"],
      "pune": ["poona"],
      "electronic city": ["electroniccity", "electronic-city"],
      "navi mumbai": ["navimumbai", "new bombay"]
    };

    const expandTerm = (term) => {
      let expanded = [term];
      for (const [standard, synonyms] of Object.entries(citySynonyms)) {
        if (term === standard || synonyms.includes(term)) {
          expanded = [standard, ...synonyms];
          break;
        }
      }
      return expanded;
    };

    if (!isDBConnected()) {
      let results = [...mockProperties].filter(p => p.status !== 'rented');
      if (city && city.trim()) {
        const searchTerms = city.trim().toLowerCase().split(/\s+/);
        results = results.filter(p => {
          return searchTerms.every(term => {
            const expanded = expandTerm(term);
            return expanded.some(t => p.city.toLowerCase().includes(t) || p.area.toLowerCase().includes(t));
          });
        });
      }
      if (area && area.trim()) {
        const searchTerms = area.trim().toLowerCase().split(/\s+/);
        results = results.filter(p => {
          return searchTerms.every(term => {
            const expanded = expandTerm(term);
            return expanded.some(t => p.area.toLowerCase().includes(t));
          });
        });
      }
      if (bhkType) results = results.filter(p => p.bhkType === bhkType);
      if (furnishing) results = results.filter(p => p.furnishing === furnishing);
      if (preference) results = results.filter(p => p.preference === preference || p.preference === 'any');
      if (minRent) results = results.filter(p => p.rent >= Number(minRent));
      if (maxRent) results = results.filter(p => p.rent <= Number(maxRent));
      return res.json(results);
    }

    let query = { status: 'available' };

    const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

    // Search city param across both city and area fields for flexible matching
    if (city && city.trim()) {
      const searchTerms = city.trim().toLowerCase().split(/\s+/);
      
      // If the entire query matches a synonym (e.g. "electroniccity" -> "electronic city")
      // Check full string first before splitting
      const fullStringExpanded = expandTerm(city.trim().toLowerCase());
      
      const andConditions = searchTerms.map(term => {
        const expandedTerms = expandTerm(term);
        const regexStr = expandedTerms.map(t => escapeRegex(t)).join('|');
        const termRegex = new RegExp(`(${regexStr})`, 'i');
        return {
          $or: [
            { city: termRegex },
            { area: termRegex }
          ]
        };
      });
      
      if (!query.$and) query.$and = [];
      query.$and.push(...andConditions);
    }
    
    if (area && area.trim()) {
      const searchTerms = area.trim().toLowerCase().split(/\s+/);
      const andConditions = searchTerms.map(term => {
        const expandedTerms = expandTerm(term);
        const regexStr = expandedTerms.map(t => escapeRegex(t)).join('|');
        const termRegex = new RegExp(`(${regexStr})`, 'i');
        return { area: termRegex };
      });
      
      if (!query.$and) query.$and = [];
      query.$and.push(...andConditions);
    }
    
    if (bhkType) query.bhkType = bhkType;
    if (furnishing) query.furnishing = furnishing;
    if (preference) query.preference = { $in: [preference, 'any'] };
    
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }

    const properties = await Property.find(query).populate('ownerId', 'name email contactNumber');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getPropertyById = async (req, res) => {
  try {
    if (!isDBConnected()) {
      const property = mockProperties.find(p => p._id === req.params.id);
      if (!property) return res.status(404).json({ message: 'Property not found' });
      return res.json(property);
    }

    const property = await Property.findById(req.params.id).populate('ownerId', 'name email contactNumber');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Owner only)
exports.createProperty = async (req, res) => {
  try {
    const normalizedCity = req.body.city ? req.body.city.toLowerCase().trim() : '';
    const normalizedArea = req.body.area ? req.body.area.toLowerCase().trim() : '';
    const normalizedBody = { ...req.body, city: normalizedCity, area: normalizedArea };

    if (!isDBConnected()) {
      const newProperty = {
        _id: Date.now().toString(),
        ...normalizedBody,
        ownerId: req.user.id,
        verifiedByAdmin: false,
        status: req.body.status || 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockProperties.push(newProperty);
      console.log(`[Mock DB] Property created: ${newProperty.apartmentName} (ID: ${newProperty._id})`);
      return res.status(201).json(newProperty);
    }

    const propertyData = { ...normalizedBody, ownerId: req.user.id };
    const property = await Property.create(propertyData);
    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get properties owned by logged in user
// @route   GET /api/properties/owner/my-properties
// @access  Private (Owner only)
exports.getMyProperties = async (req, res) => {
  try {
    if (!isDBConnected()) {
      const results = mockProperties.filter(p => p.ownerId === req.user.id);
      return res.json(results);
    }

    const properties = await Property.find({ ownerId: req.user.id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update property (e.g. status)
// @route   PUT /api/properties/:id
// @access  Private (Owner only)
exports.updateProperty = async (req, res) => {
  try {
    const normalizedBody = { ...req.body };
    if (normalizedBody.city) normalizedBody.city = normalizedBody.city.toLowerCase().trim();
    if (normalizedBody.area) normalizedBody.area = normalizedBody.area.toLowerCase().trim();

    if (!isDBConnected()) {
      const idx = mockProperties.findIndex(p => p._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Property not found' });
      if (mockProperties[idx].ownerId !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
      mockProperties[idx] = { ...mockProperties[idx], ...normalizedBody, updatedAt: new Date().toISOString() };
      return res.json(mockProperties[idx]);
    }

    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get unverified properties for admin
// @route   GET /api/properties/admin/unverified
// @access  Private (Admin only)
exports.getUnverifiedProperties = async (req, res) => {
  try {
    if (!isDBConnected()) {
      const results = mockProperties.filter(p => !p.verifiedByAdmin);
      return res.json(results);
    }

    const properties = await Property.find({ verifiedByAdmin: false }).populate('ownerId', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Verify property
// @route   PUT /api/properties/admin/verify/:id
// @access  Private (Admin only)
exports.verifyProperty = async (req, res) => {
  try {
    if (!isDBConnected()) {
      const idx = mockProperties.findIndex(p => p._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Property not found' });
      mockProperties[idx].verifiedByAdmin = true;
      return res.json({ message: 'Property verified successfully', property: mockProperties[idx] });
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id, 
      { verifiedByAdmin: true }, 
      { new: true }
    );
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ message: 'Property verified successfully', property });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
exports.deleteProperty = async (req, res) => {
  try {
    if (!isDBConnected()) {
      const idx = mockProperties.findIndex(p => p._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Property not found' });
      if (mockProperties[idx].ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized' });
      }
      mockProperties.splice(idx, 1);
      return res.json({ message: 'Property deleted' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload property images
// @route   POST /api/properties/upload
// @access  Private (Owner/Admin)
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images provided' });
    }

    // req.files is an array. If from multer-storage-cloudinary, it has file.path
    // If from local diskStorage, we construct the URL to the static folder
    const urls = req.files.map(file => {
      if (file.path && file.path.startsWith('http')) return file.path; // Cloudinary URL
      return `http://localhost:5000/uploads/${file.filename}`; // Local disk fallback
    });
    
    res.json({ message: 'Images uploaded successfully', urls });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
