export {};

const path = require('path');
const Router = require('koa-router');
const multer = require('koa-multer');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const controller = require('./storage.controller');

const storageUpload = multer({
  dest: path.join(process.cwd(), 'uploads', 'tmp'),
  limits: { fileSize: 25 * 1024 * 1024 }
});

const router = new Router({ prefix: '/storage' });
const storageAccess = [authenticate(), authorize()];

router.post('/upload', ...storageAccess, storageUpload.single('file'), controller.upload);
router.delete('/files/:folder/:filename', ...storageAccess, controller.remove);
router.get('/files/:folder/:filename', ...storageAccess, async (ctx) => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(process.cwd(), 'uploads', String(ctx.state.user.tenantId), ctx.params.folder, decodeURIComponent(ctx.params.filename));
  if (!fs.existsSync(filePath)) {
    ctx.throw(404, 'File not found');
  }
  ctx.set('Content-Type', 'application/octet-stream');
  ctx.body = fs.createReadStream(filePath);
});

module.exports = router;
