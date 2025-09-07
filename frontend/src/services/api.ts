import axios from 'axios'

// Usa proxy do Vite quando em dev (Vagrant/host) e caminho absoluto em prod
const baseURL = import.meta.env.PROD ? '/api' : '/api'

const api = axios.create({
  baseURL,
})

export default api