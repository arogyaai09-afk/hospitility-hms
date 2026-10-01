export {};

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const StorageFile = require('./storage.model');

let s3Client;

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
  return `${crypto.randomUUID()}-${cleaned}`;
}

function getS3Config() {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
  const endpoint = process.env.AWS_S3_ENDPOINT || process.env.S3_ENDPOINT_URL;
  const forcePathStyle = (process.env.AWS_S3_FORCE_PATH_STYLE || process.env.S3_USE_PATH_STYLE) === 'true';
  const prefix = String(process.env.S3_PREFIX || '').replace(/^\/+|\/+$/g, '');
  const serverSideEncryption = process.env.S3_SERVER_SIDE_ENCRYPTION || 'AES256';
  if (!region || !bucket) {
    const error = new Error('S3 storage is not configured. Set AWS_REGION and AWS_S3_BUCKET or S3_BUCKET_NAME');
    error.status = 503;
    throw error;
  }

  if (!s3Client) {
    s3Client = new S3Client({ region, endpoint, forcePathStyle });
  }
  return { client: s3Client, bucket, region, prefix, serverSideEncryption };
}

function getPublicApiBaseUrl() {
  return String(process.env.API_BASE_URL || process.env.PUBLIC_API_URL || process.env.SERVER_URL || "").replace(/\/+$/g, "");
}

function getFileUrl(objectKey, folder, storedName) {
  const relativeUrl = `/api/v1/storage/files/${folder}/${encodeURIComponent(storedName)}`;
  const baseUrl = getPublicApiBaseUrl();
  return baseUrl ? `${baseUrl}${relativeUrl}` : relativeUrl;
}

function requireTenantId(tenantId) {
  if (!tenantId) {
    const error = new Error('tenantId is required for storage operations');
    error.status = 400;
    throw error;
  }
  return tenantId;
}

async function uploadFile({ tenantId, userId, folder, file }) {
  requireTenantId(tenantId);

  if (!file) {
    const error = new Error('No file uploaded');
    error.status = 400;
    throw error;
  }

  const resolvedFolder = normalizeFolder(folder || inferFolderFromFile(file));
  const storedName = safeFilename(file.originalname || file.name || 'upload-file');
  if (!file.buffer) {
    const error = new Error('Uploaded file content is unavailable');
    error.status = 400;
    throw error;
  }

  const { client, bucket, region, prefix, serverSideEncryption } = getS3Config();
  const objectKey = [prefix, String(tenantId), resolvedFolder, storedName].filter(Boolean).join('/');
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: file.buffer,
      ContentType: file.mimetype || 'application/octet-stream',
      ServerSideEncryption: serverSideEncryption
    }));
  } catch (cause) {
    if (cause.name === 'NoSuchBucket' || cause.Code === 'NoSuchBucket') {
      const error = new Error(`S3 bucket "${bucket}" was not found. Verify that it exists in region "${region}" and that the configured AWS credentials can access its account.`);
      error.status = 503;
      throw error;
    }
    throw cause;
  }

  let record;
  try {
    record = await StorageFile.create({
      tenantId,
      userId,
      folder: resolvedFolder,
      originalName: file.originalname || file.name || storedName,
      storedName,
      objectKey,
      storageProvider: 's3',
      mimeType: file.mimetype || 'application/octet-stream',
      size: file.size || file.buffer.length,
      url: getFileUrl(objectKey, resolvedFolder, storedName)
    });
  } catch (error) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey })).catch(() => {});
    throw error;
  }

  return record.toObject();
}

async function deleteFile({ tenantId, folder, filename }) {
  requireTenantId(tenantId);

  const resolvedFolder = normalizeFolder(folder);
  const targetName = String(filename || '').trim();
  if (!targetName) {
    const error = new Error('Filename is required for deletion');
    error.status = 400;
    throw error;
  }

  const record = await StorageFile.findOne({
    tenantId,
    folder: resolvedFolder,
    storedName: targetName
  });

  if (!record) {
    const error = new Error('File not found');
    error.status = 404;
    throw error;
  }

  if (record.objectKey) {
    const { client, bucket } = getS3Config();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: record.objectKey }));
  } else if (record.filePath && fs.existsSync(record.filePath)) {
    await fs.promises.unlink(record.filePath);
  }

  await record.deleteOne();
  return {
    deleted: true,
    tenantId,
    folder: resolvedFolder,
    filename: targetName
  };
}

async function getFile({ tenantId, folder, filename }) {
  requireTenantId(tenantId);

  const resolvedFolder = normalizeFolder(folder);
  const targetName = String(filename || '').trim();
  if (!targetName) {
    const error = new Error('Filename is required');
    error.status = 400;
    throw error;
  }

  const record = await StorageFile.findOne({ tenantId, folder: resolvedFolder, storedName: targetName }).lean();
  if (!record) {
    const error = new Error('File not found');
    error.status = 404;
    throw error;
  }

  if (record.objectKey) {
    const { client, bucket } = getS3Config();
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: record.objectKey }));
    return { body: result.Body, mimeType: result.ContentType || record.mimeType, size: result.ContentLength || record.size };
  }

  const legacyPath = record.filePath || path.join(process.cwd(), 'uploads', String(tenantId), resolvedFolder, targetName);
  if (!fs.existsSync(legacyPath)) {
    const error = new Error('File not found');
    error.status = 404;
    throw error;
  }
  return { body: fs.createReadStream(legacyPath), mimeType: record.mimeType, size: fs.statSync(legacyPath).size };
}

module.exports = {
  normalizeFolder,
  inferFolderFromFile,
  uploadFile,
  deleteFile,
  getFile,
  getFileUrl,
  requireTenantId,
  allowedFolders
};
