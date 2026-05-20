const Visit = require('../models/Visit');
const Property = require('../models/Property');
const mongoose = require('mongoose');

// Mock database for fallback
const mockVisits = [];

const isDBConnected = () => mongoose.connection.readyState === 1;

// @desc    Schedule a visit (Tenant)
// @route   POST /api/visits
// @access  Private (Tenant only)
exports.scheduleVisit = async (req, res) => {
  try {
    const { propertyId, date, time } = req.body;
    console.log(`[Visit System] POST /api/visits request by user ${req.user.id}. Property ID: ${propertyId}, Date: ${date}, Time: ${time}`);

    if (!isDBConnected()) {
      const { mockProperties } = require('./propertyController');
      const property = mockProperties.find(p => p._id === propertyId);
      const ownerId = property ? property.ownerId : 'unknown';

      const visit = {
        _id: Date.now().toString(),
        propertyId,
        tenantId: req.user.id,
        ownerId,
        date,
        time,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      mockVisits.push(visit);
      console.log(`[Mock DB] Visit scheduled: Property ${propertyId} for Owner ${ownerId}`);
      return res.status(201).json(visit);
    }
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const visit = await Visit.create({
      propertyId,
      tenantId: req.user.id,
      ownerId: property.ownerId,
      date,
      time
    });

    res.status(201).json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get visits for logged-in user (Tenant or Owner)
// @route   GET /api/visits
// @access  Private
exports.getVisits = async (req, res) => {
  try {
    console.log(`[Visit System] GET /api/visits request by user ${req.user.id} (Role: ${req.user.role})`);
    if (!isDBConnected()) {
      const { mockProperties } = require('./propertyController');
      const { mockUsers } = require('./authController');

      let results = [];
      if (req.user.role === 'tenant') {
        results = mockVisits.filter(v => v.tenantId === req.user.id);
      } else if (req.user.role === 'owner') {
        results = mockVisits.filter(v => v.ownerId === req.user.id);
      }

      // Populate manually for Mock DB to match mongoose population schema
      const populatedResults = results.map(v => {
        const propertyObj = mockProperties.find(p => p._id === v.propertyId) || {};
        const tenantObj = mockUsers.find(u => u._id === v.tenantId) || {};
        const ownerObj = mockUsers.find(u => u._id === v.ownerId) || {};

        return {
          ...v,
          propertyId: {
            _id: v.propertyId,
            apartmentName: propertyObj.apartmentName || 'Unknown Property',
            area: propertyObj.area || '',
            city: propertyObj.city || '',
            images: propertyObj.images || []
          },
          tenantId: {
            _id: v.tenantId,
            name: tenantObj.name || 'Mock Tenant',
            email: tenantObj.email || ''
          },
          ownerId: {
            _id: v.ownerId,
            name: ownerObj.name || 'Mock Owner',
            email: ownerObj.email || '',
            contactNumber: propertyObj.contactNumber || ownerObj.contactNumber || ''
          }
        };
      });

      return res.json(populatedResults);
    }

    let query = {};
    if (req.user.role === 'tenant') {
      query.tenantId = req.user.id;
    } else if (req.user.role === 'owner') {
      query.ownerId = req.user.id;
    } else {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const visits = await Visit.find(query)
      .populate('propertyId', 'apartmentName area city images')
      .populate('tenantId', 'name email')
      .populate('ownerId', 'name email contactNumber');

    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update visit status (Owner approves/rejects)
// @route   PUT /api/visits/:id/status
// @access  Private (Owner only)
exports.updateVisitStatus = async (req, res) => {
  try {
    const { status } = req.body;
    console.log(`[Visit System] PUT /api/visits/${req.params.id}/status request by user ${req.user.id} to set status: ${status}`);

    if (!isDBConnected()) {
      const idx = mockVisits.findIndex(v => v._id === req.params.id);
      if (idx === -1) return res.status(404).json({ message: 'Visit not found' });
      mockVisits[idx].status = status;
      return res.json(mockVisits[idx]);
    }
    
    let visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }

    if (visit.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this visit' });
    }

    visit.status = status;
    await visit.save();

    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
