const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apartmentName: { type: String, required: true },
  floorNumber: { type: String },
  flatNumber: { type: String },
  doorNumber: { type: String },
  city: { type: String, required: true },
  area: { type: String, required: true },
  streetAddress: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  rent: { type: Number, required: true },
  bhkType: { type: String, required: true }, // e.g., '1BHK', '2BHK'
  preference: { type: String, enum: ['family', 'bachelor', 'any'], default: 'any' },
  furnishing: { type: String, enum: ['furnished', 'semi-furnished', 'unfurnished'], required: true },
  status: { type: String, enum: ['available', 'rented'], default: 'available' },
  contactNumber: { type: String, required: true },
  images: [{ type: String }], // Array of image URLs
  verifiedByAdmin: { type: Boolean, default: false },
  nearby: {
    landmarks: [{ type: String }],
    hospitals: [{ type: String }],
    transport: [{ type: String }],
    colleges: [{ type: String }],
    groceries: [{ type: String }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
