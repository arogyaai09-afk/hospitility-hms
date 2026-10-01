export {};

const Router = require('koa-router');
const multer = require('@koa/multer');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const controller = require('./storage.controller');
const { getFile } = require('./storage.service');

const storageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

const router = new Router({ prefix: '/storage' });
const storageAccess = [authenticate(), authorize()];

router.post('/upload', ...storageAccess, storageUpload.single('file'), controller.upload);
router.delete('/files/:folder/:filename', ...storageAccess, controller.remove);
router.get('/files/:folder/:filename', ...storageAccess, async (ctx) => {
  const file = await getFile({
    tenantId: controller.getTenantId(ctx),
    folder: ctx.params.folder,
    filename: decodeURIComponent(ctx.params.filename)
  });
  ctx.set('Content-Type', file.mimeType);
  ctx.set('Content-Length', String(file.size));
  ctx.set('X-Content-Type-Options', 'nosniff');
  ctx.body = file.body;
});

module.exports = router;
