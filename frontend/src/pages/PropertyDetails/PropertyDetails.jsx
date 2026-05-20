import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Phone, CheckCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '' });
  const [scheduleStatus, setScheduleStatus] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProperty(data);
        }
      } catch (error) {
        console.error('Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleScheduleVisit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedUser.token}`
        },
        body: JSON.stringify({
          propertyId: id,
          ...scheduleData
        })
      });

      if (res.ok) {
        setScheduleStatus('Visit request sent successfully to the owner!');
        setScheduleData({ date: '', time: '' });
      } else {
        setScheduleStatus('Failed to schedule visit.');
      }
    } catch (error) {
      setScheduleStatus('An error occurred.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}><h2 className="heading-2">Loading...</h2></div>;
  if (!property) return <div style={{ textAlign: 'center', padding: '4rem' }}><h2 className="heading-2">Property Not Found</h2></div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      {/* Image Gallery */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{
          height: '450px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          backgroundImage: property.images && property.images.length > 0 ? `url(${property.images[selectedImageIndex]})` : 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
        </div>

        {property.images && property.images.length > 1 && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {property.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Property thumbnail ${idx + 1}`}
                onClick={() => setSelectedImageIndex(idx)}
                style={{
                  width: '120px',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: selectedImageIndex === idx ? '2px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.1)',
                  opacity: selectedImageIndex === idx ? 1 : 0.6,
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>

        {/* Left Column: Details */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass-panel"
          style={{ padding: '2rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <h1 className="heading-2" style={{ marginBottom: '0.5rem' }}>{property.apartmentName}</h1>
              <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <MapPin size={18} /> {property.flatNumber ? `#${property.flatNumber}, ` : ''}{property.streetAddress}, {property.area}, {property.city}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>₹{property.rent?.toLocaleString('en-IN')}<span style={{ fontSize: '1.2rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '1rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>{property.bhkType}</span>
            <span style={{ fontSize: '1rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', textTransform: 'capitalize' }}>{property.furnishing}</span>
            <span style={{ fontSize: '1rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', textTransform: 'capitalize' }}>Preference: {property.preference}</span>
            <span style={{ fontSize: '1rem', padding: '0.5rem 1rem', background: property.status === 'available' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: property.status === 'available' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: property.status === 'available' ? '#10b981' : '#ef4444', textTransform: 'capitalize' }}>
              {property.status}
            </span>
          </div>

          <h3 className="heading-2" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Nearby Essentials</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: 'var(--text-secondary)' }}>
            {/* Real data would come from the database */}
            <p><CheckCircle size={16} className="text-gradient" style={{ display: 'inline', marginRight: '0.5rem' }} /> 1.2km to City Hospital</p>
            <p><CheckCircle size={16} className="text-gradient" style={{ display: 'inline', marginRight: '0.5rem' }} /> 0.5km to Central Bus Station</p>
            <p><CheckCircle size={16} className="text-gradient" style={{ display: 'inline', marginRight: '0.5rem' }} /> 2.0km to State University</p>
            <p><CheckCircle size={16} className="text-gradient" style={{ display: 'inline', marginRight: '0.5rem' }} /> 0.3km to FreshMart Grocery</p>
          </div>
        </motion.div>

        {/* Right Column: Schedule Visit */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="glass-card"
          style={{ padding: '2rem', height: 'fit-content' }}
        >
          <h3 className="heading-2" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={24} className="text-gradient" /> Schedule Visit
          </h3>

          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <strong>Owner:</strong> {property.ownerId?.name || 'Loading...'}
            </p>
            {user && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                <Phone size={16} /> {property.ownerId?.contactNumber || property.contactNumber}
              </p>
            )}
            {!user && <p style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>Login to view contact details.</p>}
          </div>

          <form onSubmit={handleScheduleVisit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Preferred Date</label>
              <input
                type="date"
                className="input-field"
                required
                value={scheduleData.date}
                onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                // For dark theme inputs, color scheme needs adjustment
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Preferred Time</label>
              <input
                type="time"
                className="input-field"
                required
                value={scheduleData.time}
                onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={!user || user.role !== 'tenant'}>
              {user ? (user.role === 'tenant' ? 'Request Visit' : 'Available for Tenants Only') : 'Login to Schedule'}
            </button>
            {scheduleStatus && (
              <p style={{ marginTop: '1rem', textAlign: 'center', color: scheduleStatus.includes('success') ? '#10b981' : '#ef4444' }}>
                {scheduleStatus}
              </p>
            )}
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default PropertyDetails;
