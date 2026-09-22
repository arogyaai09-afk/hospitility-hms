export {};

const mongoose = require('mongoose');

const storageFileSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  folder: { type: String, required: true, enum: ['images', 'videos', 'files'] },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, default: 0 },
  filePath: { type: String, required: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['active', 'deleted'], default: 'active' }
}, { timestamps: true });

storageFileSchema.index({ tenantId: 1, folder: 1, storedName: 1 }, { unique: true });
storageFileSchema.index({ tenantId: 1, createdAt: -1 });

module.exports = mongoose.model('StorageFile', storageFileSchema);
