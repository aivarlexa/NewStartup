import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

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
    throw error; // Re-throw so the component can handle it
  }
}

export default api

