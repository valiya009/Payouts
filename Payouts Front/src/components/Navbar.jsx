import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, CreditCard, LogOut, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Vendors', path: '/vendors', icon: Users },
    { name: 'Payouts', path: '/payouts', icon: CreditCard },
  ];

  if (!user) return null;

  const NavLink = ({ item, onClick }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    return (
      <Link
        to={item.path}
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
          isActive
            ? 'bg-primary-50 text-primary-600 shadow-sm'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`}
      >
        <Icon size={20} />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 w-full bg-white border-b border-slate-200 z-50 md:hidden px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <CreditCard className="text-white w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-800">PayoutPro</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <nav className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40 hidden md:block">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <CreditCard className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-800">PayoutPro</span>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-6 p-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden">
              <User className="text-slate-500 w-6 h-6" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-slate-800 truncate">
                {user.name || user.email.split('@')[0]}
              </span>
              <span className="text-xs text-slate-500">{user.role}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] bg-white z-[60] md:hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 flex-1">
                <div className="flex items-center space-x-3 mb-10">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="text-white w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold text-slate-800">PayoutPro</span>
                </div>
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink key={item.path} item={item} onClick={() => setIsOpen(false)} />
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-slate-100">
                <div className="flex items-center space-x-3 mb-6 p-2 bg-slate-50 rounded-xl">
                  <User className="w-10 h-10 p-2 bg-slate-200 rounded-full text-slate-500" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold text-slate-800 truncate">{user.email}</span>
                    <span className="text-xs text-slate-500">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
