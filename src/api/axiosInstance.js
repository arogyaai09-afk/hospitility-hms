const API_BASE_URL = "http://65.0.199.154:4000/api/v1";

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - Token expired
    if (response.status === 401) {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem('accessToken', refreshData.data.accessToken);
          localStorage.setItem('refreshToken', refreshData.data.refreshToken);

          // Retry the original request
          headers.Authorization = `Bearer ${refreshData.data.accessToken}`;
          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        throw error;
      }
    }

    return response;
  }

  async get(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'GET',
    });
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  }

  async post(endpoint, body, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  }

  async patch(endpoint, body, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  }

  async delete(endpoint, options = {}) {
    const response = await this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
      throw data;
    }
    return data;
  }
}

const axiosInstance = new ApiClient();

export default axiosInstance;
export { API_BASE_URL };
