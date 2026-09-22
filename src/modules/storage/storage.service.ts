export {};

const fs = require('fs');
const path = require('path');
const StorageFile = require('./storage.model');

const allowedFolders = ['images', 'videos', 'files'];
const mimeMap = {
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml'
  ],
  videos: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/mpeg',
    'video/ogg'
  ],
  files: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/csv',
    'application/json'
  ]
};

function normalizeFolder(folder) {
  const value = String(folder || '').trim().toLowerCase();
  if (!allowedFolders.includes(value)) {
    const error = new Error('Invalid upload folder. Allowed values: images, videos, files');
    error.status = 400;
    throw error;
  }
  return value;
}

function inferFolderFromFile(file) {
  const mimeType = String((file && (file.mimetype || file.type)) || '').toLowerCase();
  for (const folder of allowedFolders) {
    if (mimeMap[folder].includes(mimeType)) {
      return folder;
    }
  }

  const ext = String((file && (file.originalname || file.name || '')) || '').split('.').pop().toLowerCase();
  const extMap = {
    images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
    videos: ['mp4', 'webm', 'mov', 'avi', 'mpeg', 'mpg', 'mkv'],
    files: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt', 'zip', 'rar', 'json']
  };

  for (const folder of allowedFolders) {
    if (extMap[folder].includes(ext)) {
      return folder;
    }
  }

  const error = new Error('Unsupported file type. Only images, videos, and document files are allowed');
  error.status = 400;
  throw error;
}

function safeFilename(name) {
  const base = String(name || 'upload-file').split(/[\\/]/).pop();
  const cleaned = (base || 'upload-file').replace(/[^a-zA-Z0-9._-]/g, '-');
  return `${Date.now()}-${cleaned}`;
}

async function uploadFile({ tenantId, userId, folder, file }) {
  if (!file) {
    const error = new Error('No file uploaded');
    error.status = 400;
    throw error;
  }

  const resolvedFolder = normalizeFolder(folder || inferFolderFromFile(file));
  const baseDir = path.join(process.cwd(), 'uploads', String(tenantId), resolvedFolder);
  await fs.promises.mkdir(baseDir, { recursive: true });

  const storedName = safeFilename(file.originalname || file.name || 'upload-file');
  const destinationPath = path.join(baseDir, storedName);
  const sourcePath = file.path;

  if (sourcePath && sourcePath !== destinationPath) {
    await fs.promises.rename(sourcePath, destinationPath).catch(async () => {
      const content = await fs.promises.readFile(sourcePath);
      await fs.promises.writeFile(destinationPath, content);
      await fs.promises.unlink(sourcePath);
    });
  }

  const record = await StorageFile.create({
    tenantId,
    userId,
    folder: resolvedFolder,
    originalName: file.originalname || file.name || storedName,
    storedName,
    mimeType: file.mimetype || 'application/octet-stream',
    size: file.size || 0,
    filePath: destinationPath,
    url: `/uploads/${String(tenantId)}/${resolvedFolder}/${encodeURIComponent(storedName)}`
  });

  return record.toObject();
}

async function deleteFile({ tenantId, folder, filename }) {
  const resolvedFolder = normalizeFolder(folder);
  const targetName = String(filename || '').trim();
  if (!targetName) {
    const error = new Error('Filename is required for deletion');
    error.status = 400;
    throw error;
  }

  const storagePath = path.join(process.cwd(), 'uploads', String(tenantId), resolvedFolder, targetName);

  if (fs.existsSync(storagePath)) {
    await fs.promises.unlink(storagePath);
  }

  const deletedRecord = await StorageFile.findOneAndDelete({
    tenantId,
    folder: resolvedFolder,
    storedName: targetName
  });

  if (!deletedRecord && !fs.existsSync(storagePath)) {
    const error = new Error('File not found');
    error.status = 404;
    throw error;
  }

  return {
    deleted: true,
    tenantId,
    folder: resolvedFolder,
    filename: targetName,
    path: storagePath
  };
}

module.exports = {
  normalizeFolder,
  inferFolderFromFile,
  uploadFile,
  deleteFile,
  allowedFolders
};
