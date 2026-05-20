import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [unverifiedProperties, setUnverifiedProperties] = useState([]);

  const fetchUnverified = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/admin/unverified`, {
        headers: { 'Authorization': `Bearer ${storedUser.token}` }
      });
      const data = await res.json();
      if (res.ok) setUnverifiedProperties(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUnverified();
    }
  }, [user]);

  const handleVerify = async (id) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/admin/verify/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${storedUser.token}` }
      });
      if (res.ok) {
        fetchUnverified();
      }
    } catch (error) {
      console.error('Failed to verify');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Access Denied. Admin only.</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 className="heading-1" style={{ marginBottom: '2rem' }}>Admin Dashboard</h1>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ padding: '2rem' }}
      >
        <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Properties Pending Verification</h2>
        {unverifiedProperties.length === 0 ? <p>All properties are verified!</p> : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '1rem 0' }}>Owner</th>
                <th>Apartment Name</th>
                <th>Location</th>
                <th>Rent</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {unverifiedProperties.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem 0' }}>{p.ownerId?.name}<br/><span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p.ownerId?.email}</span></td>
                  <td>{p.apartmentName}</td>
                  <td>{p.city}, {p.area}</td>
                  <td>₹{p.rent?.toLocaleString('en-IN')}</td>
                  <td>
                    <button onClick={() => handleVerify(p._id)} className="btn-primary" style={{ padding: '0.5rem 1rem', background: '#10b981' }}>Verify Listing</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
