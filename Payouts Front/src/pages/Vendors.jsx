import React, { useEffect, useState, useCallback } from 'react';
import { vendorService } from '../services/api';
import { Plus, Search, Building2, CreditCard, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', upiId: '', bankAccount: '', ifsc: '' });

  const fetchVendors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await vendorService.getVendors({ search });
      setVendors(res.data);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const debounce = setTimeout(() => fetchVendors(), 300);
    return () => clearTimeout(debounce);
  }, [fetchVendors]);

  const handleAddVendor = async (e) => {
    e.preventDefault();
    
    // Frontend Validations
    if (!newVendor.name || newVendor.name.trim().length < 2) {
      return toast.error('Name must be at least 2 characters');
    }

    if (newVendor.upiId && !/^[\w.-]+@[\w.-]+$/.test(newVendor.upiId)) {
      return toast.error('Invalid UPI ID format');
    }

    if (newVendor.bankAccount && !/^\d{9,18}$/.test(newVendor.bankAccount)) {
      return toast.error('Bank account must be 9-18 digits');
    }

    if (newVendor.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(newVendor.ifsc)) {
      return toast.error('Invalid IFSC code format');
    }
    
    try {

      await vendorService.addVendor(newVendor);
      toast.success('Vendor added successfully');
      setShowModal(false);
      setNewVendor({ name: '', upiId: '', bankAccount: '', ifsc: '' });
      fetchVendors();
    } catch (error) {
      toast.error('Failed to add vendor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendors</h1>
          <p className="text-slate-500">Manage your vendor network and payment details.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center justify-center space-x-2 px-6 py-3"
        >
          <Plus size={20} />
          <span>Add Vendor</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search vendors by name..."
          className="input-field pl-12 py-3 text-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-container">
        {loading ? (
          <div className="p-20"><Loader /></div>
        ) : vendors.length > 0 ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((vendor, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  key={vendor.id} 
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 size={20} />
                      </div>
                      <span className="font-semibold text-slate-800">{vendor.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{vendor.upiId || 'No UPI'}</span>
                      <span className="text-xs text-slate-400">{vendor.bankAccount || '—'} • {vendor.ifsc || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                      {vendor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-primary-600 transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users className="text-slate-300 w-8 h-8" />
            </div>
            <p className="text-slate-500 font-medium">No vendors found</p>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Add New Vendor</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">×</button>
              </div>
              <form onSubmit={handleAddVendor} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Vendor Name *</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. Acme Corp" 
                    required 
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">UPI ID</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="e.g. acme@oksbi" 
                    value={newVendor.upiId}
                    onChange={(e) => setNewVendor({...newVendor, upiId: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Bank Account</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Account Number" 
                      value={newVendor.bankAccount}
                      onChange={(e) => setNewVendor({...newVendor, bankAccount: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">IFSC Code</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="IFSC" 
                      value={newVendor.ifsc}
                      onChange={(e) => setNewVendor({...newVendor, ifsc: e.target.value})}
                    />
                  </div>
                </div>
                <div className="pt-4 flex space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary py-3">Add Vendor</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vendors;
