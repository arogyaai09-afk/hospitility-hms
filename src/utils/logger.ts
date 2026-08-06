export {};

function log(message) {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[HMS] ${message}`);
  }
}

module.exports = { log };
