export {};

const { uploadFile, deleteFile } = require('./storage.service');
const { success } = require('../../utils/response');

function getTenantId(ctx) {
  const tenantId = ctx.state.user.role === 'admin'
    ? (ctx.request.body && ctx.request.body.tenantId) || ctx.query.tenantId
    : ctx.state.user.tenantId;

  if (!tenantId) {
    ctx.throw(400, 'tenantId is required for storage operations');
  }

  return tenantId;
}

async function upload(ctx) {
  const uploadedFile = ctx.file || ctx.req.file;
  const data = await uploadFile({
    tenantId: getTenantId(ctx),
    userId: ctx.state.user.id,
    folder: (ctx.request.body && ctx.request.body.folder) || ctx.query.folder,
    file: uploadedFile
  });

  ctx.status = 201;
  ctx.body = success(data, 'File uploaded');
}

async function remove(ctx) {
  const data = await deleteFile({
    tenantId: getTenantId(ctx),
    folder: ctx.params.folder,
    filename: ctx.params.filename
  });

  ctx.body = success(data, 'File deleted');
}

module.exports = { upload, remove, getTenantId };
