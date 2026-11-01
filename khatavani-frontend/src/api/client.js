import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto attach JWT Token to each outgoing request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('khatavani_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Page ko bar-bar reload karne se rokein!
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Agar 401 ya 403 aaye toh chupchaap error log karein, token wipe karke reload NA karein
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("API Auth Warning:", error.config?.url, error.response?.status);
    }
    return Promise.reject(error);
  }
);

export const api = {
  // 1. Auth APIs
  login: (data) => client.post('/api/auth/login', data),
  register: (data) => client.post('/api/auth/register', data),
  forgotPassword: (email) => client.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => client.post('/api/auth/reset-password', data),

  // 2. Inventory APIs
  getProducts: () => client.get('/products'),
  addProduct: (product) => client.post('/products/add-products', product),
  updateProduct: (id, product) => client.put(`/products/${id}`, product),
  deleteProduct: (id) => client.delete(`/products/${id}`),

  // Dashboard Metrics
    getDashboardStats: () => client.get('/api/dashboard/stats'),

  // 3. Billing Counter (Stock Decrement)
  createSale: (saleData) => client.post('/api/sales/create', saleData),

  // 4. Isolated Customer Udhaar Khata
  getCustomers: () => client.get('/api/customers'),
  addCustomer: (customer) => client.post('/api/customers/add', customer),
  receivePayment: (data) => client.post('/api/customers/receive-payment', data),
  getCustomerLedger: (id) => client.get(`/api/customers/${id}/ledger`),
  sendInstantReminder: (id) => client.post(`/api/customers/${id}/send-reminder`),

  // 5. AI Copilot
  askAi: (query) => client.get('/api/ai/chat', { params: { query } }),
};

export default client;