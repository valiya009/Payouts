import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { payoutService } from '../services/api';
import { TrendingUp, Users, CreditCard, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
  >
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalVendors: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
    approvedAmount: 0,
    recentPayouts: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await payoutService.getStats();
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchData();
  }, []);

  const formatTime = (date) => {
    const diff = new Date() - new Date(date);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Welcome, {user.name || user.email}</h1>
        <p className="text-slate-500">Here's what's happening with your payouts today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Vendors" 
          value={stats.totalVendors} 
          icon={Users} 
          color="bg-blue-50 text-blue-600"
          delay={0.1}
        />
        <StatCard 
          title="Total Payouts" 
          value={stats.totalPayouts} 
          icon={CreditCard} 
          color="bg-purple-50 text-purple-600"
          delay={0.2}
        />
        <StatCard 
          title="Pending Approval" 
          value={stats.pendingPayouts} 
          icon={Clock} 
          color="bg-amber-50 text-amber-600"
          delay={0.3}
        />
        <StatCard 
          title="Total Approved" 
          value={`₹${stats.approvedAmount?.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-emerald-50 text-emerald-600"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {stats.recentPayouts?.length > 0 ? (
              stats.recentPayouts.map((p) => (
                <div key={p._id} className="flex items-start space-x-4">
                  <div className={`mt-1 w-2.5 h-2.5 rounded-full ring-4 ${
                    p.status === 'Approved' ? 'bg-emerald-500 ring-emerald-50' :
                    p.status === 'Rejected' ? 'bg-red-500 ring-red-50' :
                    p.status === 'Submitted' ? 'bg-blue-500 ring-blue-50' : 'bg-slate-400 ring-slate-50'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-slate-800 font-medium">
                      Payout of <span className="font-bold">₹{p.amount.toLocaleString()}</span> {p.status === 'Draft' ? 'created' : p.status.toLowerCase()} for <span className="font-bold">{p.vendor_id?.name || 'Unknown'}</span>
                    </p>
                    <p className="text-xs text-slate-400">{formatTime(p.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Action Required</h2>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            {user.role === 'FINANCE' && stats.pendingPayouts > 0 ? (
              <div className="space-y-4 w-full text-left">
                <p className="text-sm text-slate-600">There are <span className="font-bold text-amber-600">{stats.pendingPayouts}</span> payouts waiting for your approval.</p>
                <button 
                  onClick={() => navigate('/payouts')}
                  className="w-full btn-secondary py-2 text-sm"
                >
                  Go to Payouts
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-500">No urgent tasks at the moment.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
