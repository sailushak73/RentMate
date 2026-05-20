import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await register(formData);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel"
        style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}
      >
        <h2 className="heading-2" style={{ marginBottom: '2rem', textAlign: 'center' }}>Create Account</h2>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <input 
              type="text" 
              name="name"
              className="input-field" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
            <input 
              type="email" 
              name="email"
              className="input-field" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
            <input 
              type="password" 
              name="password"
              className="input-field" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>I am a...</label>
            <select 
              name="role" 
              className="input-field" 
              value={formData.role} 
              onChange={handleChange}
              style={{ cursor: 'pointer' }}
            >
              <option value="tenant" style={{ color: '#000' }}>Tenant (Looking for rent)</option>
              <option value="owner" style={{ color: '#000' }}>Owner (Posting property)</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
            Sign Up
          </button>
        </form>

        <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
