function success(data, message = 'Success', pagination = null) {
  const response: any = { status: 'success', message, data };
  if (pagination) {
    response.pagination = pagination;
  }
  return response;
}

function error(message = 'Error', data = null) {
  return { status: 'error', message, data };
}

module.exports = { success, error };
