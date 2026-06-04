import api from './axios';

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const productApi = {
  getAll: (page = 0, size = 10) => api.get('/products', { params: { page, size } }),
  getByCategory: (categoryId, page = 0, size = 10) =>
    api.get(`/products/category/${categoryId}`, { params: { page, size } }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const clientApi = {
  getAll: (page = 0, size = 10) => api.get('/clients', { params: { page, size } }),
  search: (name, page = 0, size = 10) =>
    api.get('/clients/search', { params: { name, page, size } }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

export const purchaseApi = {
  getAll: (page = 0, size = 10) => api.get('/purchases', { params: { page, size } }),
  getByClient: (clientId, page = 0, size = 10, sort = 'purchaseDate,desc') =>
    api.get(`/purchases/client/${clientId}`, { params: { page, size, sort } }),
  getByDateRange: (startDate, endDate, page = 0, size = 10) =>
    api.get('/purchases/date', { params: { startDate, endDate, page, size } }),
  create: (data) => api.post('/purchases', data),
  updatePaid: (id, paid) => api.patch(`/purchases/${id}/paid`, { paid }),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};
