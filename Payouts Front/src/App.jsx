import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import Payouts from './pages/Payouts';
import PayoutDetail from './pages/PayoutDetail';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/vendors" element={
            <ProtectedRoute>
              <Layout><Vendors /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/payouts" element={
            <ProtectedRoute>
              <Layout><Payouts /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/payouts/:id" element={
            <ProtectedRoute>
              <Layout><PayoutDetail /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;