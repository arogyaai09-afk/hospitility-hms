export {};

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  line1: { type: String, trim: true },
  line2: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  country: { type: String, trim: true }
}, { _id: false });

const tenantSettingsSchema = new mongoose.Schema({
  profile: {
    legalName: { type: String, trim: true },
    displayName: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    website: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    taxNumber: { type: String, trim: true },
    address: { type: addressSchema, default: () => ({}) }
  },
  branding: {
    headerColor: { type: String, trim: true },
    footerColor: { type: String, trim: true },
    fontFamily: { type: String, trim: true },
    buttonColor: { type: String, trim: true },
    buttonTextColor: { type: String, trim: true }
  }
}, { _id: false });

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  state: { type: String, required: true },
  country: { type: String, default: 'India' },
  settings: { type: tenantSettingsSchema, default: () => ({}) },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);
