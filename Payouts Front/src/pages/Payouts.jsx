import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { payoutService, vendorService } from '../services/api';
import { Plus, Filter, Search, Calendar, ChevronRight, CreditCard, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Payouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [vendorFilter, setVendorFilter] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPayout, setNewPayout] = useState({ vendorId: '', amount: '', mode: 'UPI', note: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch vendors once for the dropdown filter & create modal
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const res = await vendorService.getVendors();
        setVendors(res.data);
      } catch (error) {
        toast.error('Failed to load vendors');
      }
    };
    loadVendors();
  }, []);

  // Fetch payouts with backend filters
  const fetchPayouts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await payoutService.getPayouts({
        status: statusFilter,
        vendorId: vendorFilter,
        search,
        page: pagination.page,
      });
      setPayouts(res.data);
      setPagination(prev => ({ ...prev, pages: res.pages, total: res.total }));
    } catch (error) {
      toast.error('Failed to load payouts');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, vendorFilter, search, pagination.page]);

  // Debounced fetch when filters change
  useEffect(() => {
    const debounce = setTimeout(() => fetchPayouts(), 300);
    return () => clearTimeout(debounce);
  }, [fetchPayouts]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [statusFilter, vendorFilter, search]);

  const handleCreatePayout = async (e) => {
    e.preventDefault();
    
    // Frontend Validations
    if (!newPayout.vendorId) return toast.error('Please select a vendor');
    
    const amount = parseFloat(newPayout.amount);
    if (!amount || amount <= 0) {
      return toast.error('Please enter a valid amount greater than 0');
    }
    if (amount > 10000000) {
      return toast.error('Amount exceeds maximum single payout limit (1 Cr)');
    }

    if (!['UPI', 'IMPS', 'NEFT'].includes(newPayout.mode)) {
      return toast.error('Please select a valid payment mode');
    }

    try {
      const res = await payoutService.createPayout({
        ...newPayout,
        amount: amount
      });

      toast.success('Payout created as Draft');
      setShowCreateModal(false);
      setNewPayout({ vendorId: '', amount: '', mode: 'UPI', note: '' });
      navigate(`/payouts/${res.data.id}`);
    } catch (error) {
      toast.error('Failed to create payout');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-600';
      case 'Submitted': return 'bg-blue-50 text-blue-600';
      case 'Approved': return 'bg-emerald-50 text-emerald-600';
      case 'Rejected': return 'bg-red-50 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payouts</h1>
          <p className="text-slate-500">Track and manage all outgoing payments.</p>
        </div>
        {user.role === 'OPS' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center justify-center space-x-2 px-6 py-3"
          >
            <Plus size={20} />
            <span>Create Payout</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by vendor name..."
              className="input-field pl-11 py-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 lg:w-48">
              <select 
                className="input-field py-2"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="flex-1 lg:w-48">
              <select 
                className="input-field py-2"
                value={vendorFilter}
                onChange={(e) => setVendorFilter(e.target.value)}
              >
                <option value="All">All Vendors</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <div className="text-xs text-slate-400 font-medium">
            Showing {payouts.length} of {pagination.total} payouts
          </div>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div className="p-20"><Loader /></div>
        ) : payouts.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((payout, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={payout.id} 
                  onClick={() => navigate(`/payouts/${payout.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800">{payout.vendorName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 font-mono">₹{payout.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{payout.mode}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(payout.status)}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-xs text-slate-400">
                      <Calendar size={14} className="mr-1" />
                      {payout.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight size={18} className="inline text-slate-300 group-hover:text-primary-500 transition-colors" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="text-slate-300 w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No payouts found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-slate-500 font-medium px-4">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
            disabled={pagination.page === pagination.pages}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Payout Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Create New Payout</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
              </div>
              <form onSubmit={handleCreatePayout} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Vendor *</label>
                  <select 
                    className="input-field" 
                    required 
                    value={newPayout.vendorId}
                    onChange={(e) => setNewPayout({...newPayout, vendorId: e.target.value})}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Amount (₹) *</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      placeholder="0.00" 
                      required 
                      min="1"
                      value={newPayout.amount}
                      onChange={(e) => setNewPayout({...newPayout, amount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Payment Mode</label>
                    <select 
                      className="input-field" 
                      value={newPayout.mode}
                      onChange={(e) => setNewPayout({...newPayout, mode: e.target.value})}
                    >
                      <option value="UPI">UPI</option>
                      <option value="IMPS">IMPS</option>
                      <option value="NEFT">NEFT</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Internal Note</label>
                  <textarea 
                    className="input-field min-h-[100px] py-3" 
                    placeholder="Add details about this payout..." 
                    value={newPayout.note}
                    onChange={(e) => setNewPayout({...newPayout, note: e.target.value})}
                  />
                </div>
                <div className="pt-4 flex space-x-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary py-3">Create Draft</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Payouts;
