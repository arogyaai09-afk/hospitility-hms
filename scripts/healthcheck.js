const http = require('http');
const https = require('https');

const baseUrl = process.env.APP_BASE_URL || `http://127.0.0.1:${process.env.PORT || 4000}`;
const targetUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/health`;

function request(url) {
  return new Promise((resolve, reject) => {
    const transport = url.startsWith('https:') ? https : http;
    const req = transport.get(url, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          body,
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('Healthcheck request timed out'));
    });
  });
}

(async () => {
  try {
    const response = await request(targetUrl);
    const contentType = response.body && response.body.length ? response.body : '';
    const data = contentType ? JSON.parse(contentType) : {};

    if (response.statusCode !== 200 || data.status !== 'ok') {
      console.error(`Healthcheck failed for ${targetUrl}: status=${response.statusCode}, body=${contentType || '<empty>'}`);
      process.exit(1);
    }

    console.log(`Healthcheck passed: ${targetUrl}`);
  } catch (error) {
    console.error(`Healthcheck failed for ${targetUrl}: ${error.message}`);
    process.exit(1);
  }
})();
