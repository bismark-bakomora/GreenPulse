import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token') || localStorage.getItem('gp_recycler_token') || localStorage.getItem('gp_resident_token') || localStorage.getItem('gp_admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const reportAPI = {
  submit:       (fd)  => api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:       ()    => api.get('/reports'),
  getHeatmap:   ()    => api.get('/reports/heatmap'),
  updateStatus: (id, d) => api.patch(`/reports/${id}`, d),
  getAvailableForRecycler: (type) => api.get(`/reports/available-waste?type=${type}`),
}

export const collectionAPI = {
  log:           (d)  => api.post('/collections', d),
  getStats:      ()   => api.get('/collections/stats'),
  getByCollector:(id) => api.get(`/collections/collector/${id}`),
  getAvailable:  ()   => api.get('/collections/available'),
}

export const authAPI = {
  collectorLogin:    (d) => api.post('/auth/collector/login', d),
  collectorRegister: (d) => api.post('/auth/collector/register', d),
  recyclerLogin:     (d) => api.post('/auth/recycler/login', d),
  recyclerRegister:  (d) => api.post('/auth/recycler/register', d),
  adminLogin:        (d) => api.post('/auth/admin/login', d),
}

export const collectorAPI = {
  getProfile: (id) => api.get(`/collectors/${id}`),
  getAll:     ()   => api.get('/collectors'),
}

export const recyclerAPI = {
  getProfile:        (id) => api.get(`/recyclers/${id}`),
  getAll:            ()   => api.get('/recyclers'),
  getMarketplace:    (filters) => api.get('/recyclers/marketplace', { params: filters }),
  placeOrder:        (d)  => api.post('/recyclers/orders', d),
  getOrders:         (id) => api.get(`/recyclers/${id}/orders`),
  dispatchTricycle:  (d)  => api.post('/recyclers/dispatch', d),
  getDispatches:     (id) => api.get(`/recyclers/${id}/dispatches`),
  updateDispatch:    (id, d) => api.patch(`/recyclers/dispatches/${id}`, d),
  getAvailableTricycles: () => api.get('/recyclers/tricycles/available'),
  getDemands:          () => api.get('/recyclers/demands'),
  createDemand:        (d) => api.post('/recyclers/demands', d),
}

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
}

export const zoneAPI = {
  getAll:       () => api.get('/zones'),
  get:          (id) => api.get(`/zones/${id}`),
  campaign:     (id, data) => api.post(`/zones/${id}/campaigns`, data),
}

export const residentAPI = {
  register:     (data) => api.post('/residents/register', data),
  login:        (data) => api.post('/residents/login', data),
  getProfile:   (id) => api.get(`/residents/${id}`),
  logDropoff:   (id, data) => api.post(`/residents/${id}/dropoffs`, data),
  redeem:       (id, data) => api.post(`/residents/${id}/redemptions`, data),
  requestPickup:(id, data) => api.post(`/residents/${id}/pickups`, data),
  getPickups:   (id) => api.get(`/residents/${id}/pickups`),
  leaderboard:  () => api.get('/residents/leaderboard/zones'),
}

export const pickupAPI = {
  getAvailable:  () => api.get('/pickups/available'),
  accept:        (id) => api.post(`/pickups/${id}/accept`),
  getByCollector:(id) => api.get(`/pickups/collector/${id}`),
  collect:       (id) => api.post(`/pickups/${id}/collect`),
}

export const routingAPI = {
  optimize: (d) => api.post('/routing/optimize', d),
}

export const weatherAPI = {
  getForecast: () => api.get('/weather/forecast'),
}
