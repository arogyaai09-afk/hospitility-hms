// ui/src/api/axiosInstance.js
const API_BASE_URL = "http://16.4.26.131:4000/api/v1";

class ApiClient {
  async request(endpoint, options = {}) {
    const { params, ...fetchOptions } = options;

    let url = `${API_BASE_URL}${endpoint}`;

    // Add query parameters
    if (params) {
      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              queryParams.append(key, item);
            });
          } else {
            queryParams.append(key, value);
          }
        }
      });

      const queryString = queryParams.toString();

      if (queryString) {
        url += endpoint.includes("?") ? `&${queryString}` : `?${queryString}`;
      }
    }

    const headers = {
      ...(fetchOptions.headers || {}),
    };

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    let response = await fetch(url, {
      ...fetchOptions,
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
            ...fetchOptions,
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

  async getBlob(endpoint, options = {}) {
    let normalizedEndpoint = endpoint;

    // Server may return a full storage URL.
    // Convert it to an API-relative endpoint before using request().
    if (/^https?:\/\//i.test(endpoint)) {
      const parsedUrl = new URL(endpoint);
      const apiPath = new URL(API_BASE_URL).pathname;

      normalizedEndpoint = parsedUrl.pathname;

      if (normalizedEndpoint.startsWith(apiPath)) {
        normalizedEndpoint = normalizedEndpoint.slice(apiPath.length);
      }

      if (parsedUrl.search) {
        normalizedEndpoint += parsedUrl.search;
      }
    }

    const response = await this.request(normalizedEndpoint, {
      ...options,
      method: "GET",
    });

    if (!response.ok) {
      let error;

      try {
        error = await response.json();
      } catch {
        error = { message: "Failed to fetch file" };
      }

      throw error;
    }

    return await response.blob();
  }

  async post(endpoint, body, options = {}) {
    const isFormData = body instanceof FormData;

    const response = await this.request(endpoint, {
      ...options,
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
      headers: isFormData
        ? {
          ...(options.headers || {}),
        }
        : {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
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
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
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
