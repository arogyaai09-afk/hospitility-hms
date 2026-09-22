const assert = require('assert');
const { normalizeFolder, inferFolderFromFile } = require('./storage.service');

assert.strictEqual(normalizeFolder('images'), 'images');
assert.strictEqual(normalizeFolder('videos'), 'videos');
assert.strictEqual(normalizeFolder('files'), 'files');
assert.throws(() => normalizeFolder('archive'), /Invalid upload folder/i);
assert.strictEqual(inferFolderFromFile({ mimetype: 'image/png', originalFilename: 'photo.png' }), 'images');
assert.strictEqual(inferFolderFromFile({ mimetype: 'video/mp4', originalFilename: 'clip.mp4' }), 'videos');
assert.strictEqual(inferFolderFromFile({ mimetype: 'application/pdf', originalFilename: 'report.pdf' }), 'files');

console.log('storage validation tests passed');
