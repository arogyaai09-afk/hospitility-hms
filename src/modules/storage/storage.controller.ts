export {};

const { uploadFile, deleteFile } = require('./storage.service');
const { success } = require('../../utils/response');

async function upload(ctx) {
  const uploadedFile = ctx.file || ctx.req.file;
  const data = await uploadFile({
    tenantId: ctx.state.user.tenantId,
    userId: ctx.state.user.id,
    folder: (ctx.request.body && ctx.request.body.folder) || ctx.query.folder,
    file: uploadedFile
  });

  ctx.status = 201;
  ctx.body = success(data, 'File uploaded');
}

async function remove(ctx) {
  const data = await deleteFile({
    tenantId: ctx.state.user.tenantId,
    folder: ctx.params.folder,
    filename: ctx.params.filename
  });

  ctx.body = success(data, 'File deleted');
}

module.exports = { upload, remove };
