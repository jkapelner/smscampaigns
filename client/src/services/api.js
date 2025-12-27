import axios from 'axios'
import store from '../store'
import router from '../router'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = store.state.auth.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred'

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      store.dispatch('auth/logout')
      router.push('/login')
    }

    // Store error in Vuex
    store.commit('setError', message)

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  signup: (email, password) => api.post('/auth/signup', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password })
}

// Campaign API
export const campaignAPI = {
  getAll: () => api.get('/campaigns'),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  send: (id) => api.post(`/campaigns/${id}/send`),
  getStats: (id) => api.get(`/campaigns/${id}/stats`)
}

// Contact API
export const contactAPI = {
  getAllByCampaign: (campaignId) => api.get(`/campaigns/${campaignId}/contacts`),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (campaignId, data) => api.post(`/campaigns/${campaignId}/contacts`, data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`)
}

export default api
