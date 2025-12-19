const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/';

// Debug configuration
const DEBUG = process.env.NODE_ENV === 'development';
const DEBUG_PREFIX = '🚀 API Service:';

const logDebug = (message, data = null) => {
  if (DEBUG) {
    console.log(`${DEBUG_PREFIX} ${message}`, data ? data : '');
  }
};

const logError = (message, error = null) => {
  console.error(`${DEBUG_PREFIX} ${message}`, error ? error : '');
};

const logWarning = (message, data = null) => {
  console.warn(`${DEBUG_PREFIX} ${message}`, data ? data : '');
};

export const apiService = {
  get: async (url) => {
    const startTime = Date.now();
    const requestId = `GET_${url}_${startTime}`;

    try {
      logDebug(`[${requestId}] Starting GET request`, { url, API_URL });

      // Validate URL
      if (!url || typeof url !== 'string') {
        throw new Error(`Invalid URL: ${url}`);
      }

      const fullUrl = `${API_URL}${url}`;
      logDebug(`[${requestId}] Full URL`, fullUrl);

      // Check if we're online
      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      logDebug(`[${requestId}] Making fetch request`);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;
      logDebug(`[${requestId}] Response received`, {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError(`[${requestId}] HTTP Error`, {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          response: errorText
        });
        throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      logDebug(`[${requestId}] Request successful`, {
        responseTime: `${responseTime}ms`,
        dataLength: Array.isArray(data) ? data.length : Object.keys(data).length,
        dataSample: DEBUG ? data : 'Data logged only in development'
      });

      return data;

    } catch (error) {
      const errorTime = Date.now() - startTime;
      logError(`[${requestId}] Request failed after ${errorTime}ms`, {
        error: error.message,
        errorType: error.constructor.name,
        url,
        stack: DEBUG ? error.stack : undefined
      });

      // Enhanced error messages for common issues
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (error.message.includes('Failed to fetch')) {
          const enhancedError = new Error(`Network error: Cannot connect to server at ${API_URL}. Check if the server is running and CORS is configured.`);
          enhancedError.originalError = error;
          throw enhancedError;
        }
      }

      throw error;
    }
  },

  post: async (url, data) => {
    const startTime = Date.now();
    const requestId = `POST_${url}_${startTime}`;

    try {
      logDebug(`[${requestId}] Starting POST request`, {
        url,
        API_URL,
        data: DEBUG ? data : `Data size: ${JSON.stringify(data)?.length || 0} chars`
      });

      if (!url || typeof url !== 'string') {
        throw new Error(`Invalid URL: ${url}`);
      }

      const fullUrl = `${API_URL}${url}`;

      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      logDebug(`[${requestId}] Making fetch request with data`);

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseTime = Date.now() - startTime;
      logDebug(`[${requestId}] Response received`, {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError(`[${requestId}] HTTP Error`, {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          requestData: DEBUG ? data : 'Data hidden in production',
          response: errorText
        });
        throw new Error(`POST ${url} failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      logDebug(`[${requestId}] Request successful`, {
        responseTime: `${responseTime}ms`,
        responseData: DEBUG ? responseData : 'Response data logged only in development'
      });

      return responseData;

    } catch (error) {
      const errorTime = Date.now() - startTime;
      logError(`[${requestId}] Request failed after ${errorTime}ms`, {
        error: error.message,
        errorType: error.constructor.name,
        url,
        data: DEBUG ? data : 'Data hidden in production'
      });
      throw error;
    }
  },

  put: async (url, data) => {
    const startTime = Date.now();
    const requestId = `PUT_${url}_${startTime}`;

    try {
      logDebug(`[${requestId}] Starting PUT request`, {
        url,
        API_URL,
        data: DEBUG ? data : `Data size: ${JSON.stringify(data)?.length || 0} chars`
      });

      if (!url || typeof url !== 'string') {
        throw new Error(`Invalid URL: ${url}`);
      }

      const fullUrl = `${API_URL}${url}`;

      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      logDebug(`[${requestId}] Making fetch request with data`);

      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseTime = Date.now() - startTime;
      logDebug(`[${requestId}] Response received`, {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError(`[${requestId}] HTTP Error`, {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          requestData: DEBUG ? data : 'Data hidden in production',
          response: errorText
        });
        throw new Error(`PUT ${url} failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      logDebug(`[${requestId}] Request successful`, {
        responseTime: `${responseTime}ms`,
        responseData: DEBUG ? responseData : 'Response data logged only in development'
      });

      return responseData;

    } catch (error) {
      const errorTime = Date.now() - startTime;
      logError(`[${requestId}] Request failed after ${errorTime}ms`, {
        error: error.message,
        errorType: error.constructor.name,
        url,
        data: DEBUG ? data : 'Data hidden in production'
      });
      throw error;
    }
  },

  delete: async (url) => {
    const startTime = Date.now();
    const requestId = `DELETE_${url}_${startTime}`;

    try {
      logDebug(`[${requestId}] Starting DELETE request`, { url, API_URL });

      if (!url || typeof url !== 'string') {
        throw new Error(`Invalid URL: ${url}`);
      }

      const fullUrl = `${API_URL}${url}`;

      if (!navigator.onLine) {
        throw new Error('No internet connection');
      }

      logDebug(`[${requestId}] Making fetch request`);

      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;
      logDebug(`[${requestId}] Response received`, {
        status: response.status,
        statusText: response.statusText,
        responseTime: `${responseTime}ms`
      });

      if (!response.ok) {
        const errorText = await response.text();
        logError(`[${requestId}] HTTP Error`, {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          response: errorText
        });
        throw new Error(`DELETE ${url} failed: ${response.status} ${response.statusText}`);
      }

      // For DELETE, response might be empty
      let responseData = {};
      try {
        const text = await response.text();
        if (text) {
          responseData = JSON.parse(text);
        }
      } catch (parseError) {
        logDebug(`[${requestId}] No JSON response or parse error`, parseError);
      }

      logDebug(`[${requestId}] Request successful`, {
        responseTime: `${responseTime}ms`,
        responseData: DEBUG ? responseData : 'Response data logged only in development'
      });

      return responseData;

    } catch (error) {
      const errorTime = Date.now() - startTime;
      logError(`[${requestId}] Request failed after ${errorTime}ms`, {
        error: error.message,
        errorType: error.constructor.name,
        url
      });
      throw error;
    }
  },

  // Utility method for debugging
  debug: {
    getConfig: () => ({
      API_URL,
      DEBUG,
      environment: process.env.NODE_ENV,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL
    }),

    testConnection: async () => {
      logDebug('Testing API connection');
      try {
        const response = await fetch(API_URL);
        logDebug('Connection test result', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
        return response.ok;
      } catch (error) {
        logError('Connection test failed', error);
        return false;
      }
    },

    clearLogs: () => {
      if (DEBUG && console.clear) {
        console.clear();
        logDebug('Console cleared');
      }
    }
  }
};

// Add global error handler for uncaught fetch errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('fetch')) {
      logError('Unhandled fetch rejection', event.reason);
    }
  });
}

export default apiService;