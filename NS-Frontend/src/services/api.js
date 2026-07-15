import axios from 'axios'

const api = axios.create({
  // Ensures it points cleanly to your backend port 3000 if VITE_API_URL is configured
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    // 1. Ensure the headers object exists safely
    config.headers = config.headers || {}

    // 2. Extract the token dynamically at the moment of the request
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // Useful debug log to catch if requests are escaping without a token string
      console.warn(`[Axios Interceptor] No token found in storage for path: ${config.url}`)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export function getApiErrorMessage(error, fallback = 'Request failed.') {
  if (!error.response) {
    return 'Unable to connect to the server.'
  }
  return error.response.data?.message || fallback
}

export async function getAvailableSlots(date, duration) {
  try {
    const response = await api.get('/bookings/slots', { params: { date, duration } });
    return response.data.slots || [];
  } catch (error) {
    console.error("Failed to load slots:", getApiErrorMessage(error));
    throw error;
  }
}

export default api