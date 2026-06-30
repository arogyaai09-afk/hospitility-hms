function success(data, message = 'Success') {
  return { status: 'success', message, data };
}

function error(message = 'Error', data = null) {
  return { status: 'error', message, data };
}

module.exports = { success, error };
