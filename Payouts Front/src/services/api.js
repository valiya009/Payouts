import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Map backend snake_case vendor to frontend camelCase
const mapVendor = (v) => ({
  id: v._id,
  name: v.name,
  upiId: v.upi_id || '',
  bankAccount: v.bank_account || '',
  ifsc: v.ifsc || '',
  status: v.is_active ? 'Active' : 'Inactive',
});

export const vendorService = {
  // GET /vendors?search=...
  getVendors: async (filters = {}) => {
    const params = {};
    if (filters.search) params.search = filters.search;

    const res = await api.get('/vendors', { params });
    return { data: (res.data.vendors || []).map(mapVendor) };
  },

  addVendor: async (vendor) => {
    const res = await api.post('/vendors', {
      name: vendor.name,
      upi_id: vendor.upiId,
      bank_account: vendor.bankAccount,
      ifsc: vendor.ifsc,
    });
    return { data: mapVendor(res.data.vendor) };
  },
};

// Map backend payout to frontend shape
const mapPayout = (p) => ({
  id: p._id,
  vendorId: p.vendor_id?._id || p.vendor_id,
  vendorName: p.vendor_id?.name || 'Unknown Vendor',
  amount: p.amount,
  mode: p.mode,
  note: p.note,
  status: p.status,
  rejectReason: p.decision_reason || '',
  date: new Date(p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  createdAt: p.createdAt,
});

export const payoutService = {
  // GET /payouts?status=...&vendor_id=...&search=...&page=...&limit=...
  getPayouts: async (filters = {}) => {
    const params = {};
    if (filters.status && filters.status !== 'All') params.status = filters.status;
    if (filters.vendorId && filters.vendorId !== 'All') params.vendor_id = filters.vendorId;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const res = await api.get('/payouts', { params });
    return {
      data: (res.data.payouts || []).map(mapPayout),
      total: res.data.total || 0,
      page: res.data.page || 1,
      pages: res.data.pages || 1,
    };
  },

  getStats: async () => {
    const res = await api.get('/payouts/stats');
    return { data: res.data.stats };
  },

  getPayoutById: async (id) => {

    const res = await api.get(`/payouts/${id}`);
    const mapped = mapPayout(res.data.payout);
    // Map audit trail to frontend shape
    mapped.auditTrail = (res.data.audit || []).map(a => ({
      status: a.action,
      user: a.user_id?.email || 'System',
      timestamp: new Date(a.timestamp).toLocaleString('en-IN'),
    }));
    return { data: mapped };
  },

  createPayout: async (payout) => {
    const res = await api.post('/payouts', {
      vendor_id: payout.vendorId,
      amount: payout.amount,
      mode: payout.mode,
      note: payout.note,
    });
    return { data: mapPayout(res.data.payout) };
  },

  submitPayout: async (id) => {
    const res = await api.post(`/payouts/${id}/submit`);
    return { data: mapPayout(res.data.payout) };
  },

  approvePayout: async (id) => {
    const res = await api.post(`/payouts/${id}/approve`);
    return { data: mapPayout(res.data.payout) };
  },

  rejectPayout: async (id, reason) => {
    const res = await api.post(`/payouts/${id}/reject`, { reason });
    return { data: mapPayout(res.data.payout) };
  },
};

export default api;
