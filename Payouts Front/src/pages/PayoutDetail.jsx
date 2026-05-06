import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payoutService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Send, CheckCircle2, XCircle, Clock, Building2, CreditCard, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const PayoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayout = async () => {
    try {
      const res = await payoutService.getPayoutById(id);
      if (!res.data) throw new Error('Payout not found');
      setPayout(res.data);
    } catch (error) {
      toast.error(error.message || 'Failed to load payout');
      navigate('/payouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayout();
  }, [id]);

  const handleAction = async (action, payload) => {
    setActionLoading(true);
    try {
      if (action === 'submit') await payoutService.submitPayout(id);
      if (action === 'approve') await payoutService.approvePayout(id);
      
      if (action === 'reject') {
        if (!payload || payload.trim().length < 10) {
          return toast.error('Please provide a substantial rejection reason (min 10 chars)');
        }
        await payoutService.rejectPayout(id, payload);
      }


      
      toast.success(`Payout ${action}ed successfully`);
      if (action === 'reject') setShowRejectModal(false);
      fetchPayout(); // Refresh data from backend
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} payout`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!payout) return null;

  const getStatusBadge = (status) => {
    const styles = {
      Draft: 'bg-slate-100 text-slate-600',
      Submitted: 'bg-blue-50 text-blue-600',
      Approved: 'bg-emerald-50 text-emerald-600',
      Rejected: 'bg-red-50 text-red-600'
    };
    return <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${styles[status]}`}>{status}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => navigate('/payouts')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-800">Payout #{payout.id?.slice(-6)}</h1>
            {getStatusBadge(payout.status)}
          </div>
          <p className="text-slate-500">Created on {payout.date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Main Details Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Payment Information</h3>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vendor</p>
                <div className="flex items-center space-x-2">
                  <Building2 size={18} className="text-primary-500" />
                  <p className="font-semibold text-slate-800">{payout.vendorName}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</p>
                <div className="flex items-center space-x-2">
                  <CreditCard size={18} className="text-primary-500" />
                  <p className="text-xl font-bold text-slate-900 font-mono">₹{payout.amount?.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Mode</p>
                <p className="font-medium text-slate-700">{payout.mode}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Internal Note</p>
                <p className="text-sm text-slate-600 italic">"{payout.note || 'No notes provided'}"</p>
              </div>
            </div>

            {payout.status === 'Rejected' && payout.rejectReason && (
              <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3">
                <Info size={20} className="text-red-500 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700 uppercase tracking-wider mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-600 font-medium">{payout.rejectReason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            {payout.status === 'Draft' && user.role === 'OPS' && (
              <button 
                onClick={() => handleAction('submit')}
                disabled={actionLoading}
                className="btn-primary px-10 py-4 flex items-center space-x-2 shadow-lg shadow-primary-200 disabled:opacity-50"
              >
                <Send size={20} />
                <span className="font-bold">{actionLoading ? 'Submitting...' : 'Submit for Approval'}</span>
              </button>
            )}

            {payout.status === 'Submitted' && user.role === 'FINANCE' && (
              <>
                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="bg-white border-2 border-red-200 text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <XCircle size={20} />
                  <span>Reject</span>
                </button>
                <button 
                  onClick={() => handleAction('approve')}
                  disabled={actionLoading}
                  className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center space-x-2 shadow-lg shadow-emerald-200 disabled:opacity-50"
                >
                  <CheckCircle2 size={20} />
                  <span>{actionLoading ? 'Approving...' : 'Approve Payment'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Audit Trail Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <Clock size={18} className="text-slate-400" />
              <span>Audit Trail</span>
            </h3>
            {payout.auditTrail && payout.auditTrail.length > 0 ? (
              <div className="relative space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {payout.auditTrail.map((log, idx) => (
                  <div key={idx} className="relative pl-10">
                    <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                      log.status === 'APPROVED' ? 'bg-emerald-500' : 
                      log.status === 'REJECTED' ? 'bg-red-500' : 
                      log.status === 'SUBMITTED' ? 'bg-blue-500' : 'bg-slate-400'
                    }`} />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{log.status}</p>
                      <p className="text-xs text-slate-500">{log.user}</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No audit history yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRejectModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
                <h3 className="text-xl font-bold text-red-800">Reject Payout</h3>
                <button onClick={() => setShowRejectModal(false)} className="text-red-400 hover:text-red-600">×</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Reason for Rejection *</label>
                  <textarea 
                    className="input-field min-h-[120px] py-3 focus:ring-red-500" 
                    placeholder="Provide a detailed reason for rejecting this payout..." 
                    required 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button onClick={() => setShowRejectModal(false)} className="flex-1 btn-secondary py-3">Cancel</button>
                  <button 
                    onClick={() => {
                      if (!rejectReason) return toast.error('Reason is required');
                      handleAction('reject', rejectReason);
                    }}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all active:scale-95 py-3 disabled:opacity-50"
                  >
                    {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayoutDetail;
