import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-panel"
      style={{
        position: 'sticky',
        top: '1rem',
        zIndex: 50,
        margin: '0 2rem',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '16px',
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Home className="text-gradient" size={28} />
        <span className="heading-2" style={{ fontSize: '1.5rem' }}>RentMate</span>
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/search" style={{ fontWeight: 500, transition: 'color 0.3s' }}>Search</Link>
        
        {user ? (
          <>
            {user.role === 'owner' && (
              <Link to="/dashboard/owner" className="btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Post Property
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/dashboard/admin" className="btn-outline" style={{ padding: '0.5rem 1rem' }}>
                Admin Panel
              </Link>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} /> {user.name}
              </span>
              <button onClick={handleLogout} className="btn-outline" style={{ padding: '0.5rem', border: 'none', color: '#ef4444' }}>
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login" className="btn-outline" style={{ padding: '0.5rem 1.25rem' }}>Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Sign Up</Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
