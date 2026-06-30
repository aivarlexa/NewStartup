import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
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
