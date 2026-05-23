import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8080'
})

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const isAuthEndpoint = config.url.includes('/api/auth/')
  if (token && !isAuthEndpoint) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default API