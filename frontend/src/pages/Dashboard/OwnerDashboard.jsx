import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);
  const [activeTab, setActiveTab] = useState('properties'); // 'properties', 'visits', 'post'

  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, propertyId: null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, propertyId: null, currentStatus: '' });

  // Image Upload States
  const [selectedImages, setSelectedImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const fetchProperties = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch('http://{import.meta.env.VITE_API_URL}/api/properties/owner/my-properties', {
        headers: { 'Authorization': `Bearer ${storedUser.token}` }
      });
      const data = await res.json();
      if (res.ok) setProperties(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchVisits = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch('http://{import.meta.env.VITE_API_URL}/api/visits', {
        headers: { 'Authorization': `Bearer ${storedUser.token}` }
      });
      const data = await res.json();
      if (res.ok) setVisits(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let interval;
    if (user?.role === 'owner') {
      fetchProperties();
      fetchVisits();

      // Real-time polling for new visit requests
      interval = setInterval(() => {
        fetchVisits();
      }, 5000); // Poll every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const [formData, setFormData] = useState({
    apartmentName: '', city: '', area: '', streetAddress: '', rent: '', bhkType: '1BHK',
    furnishing: 'unfurnished', preference: 'any', contactNumber: ''
  });

  const handleImageSelect = (e) => {
    if (e.target.files) {
      setSelectedImages(Array.from(e.target.files));
    }
  };

  const handlePostProperty = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));

      let uploadedUrls = [];
      if (selectedImages.length > 0) {
        const imgFormData = new FormData();
        selectedImages.forEach(file => imgFormData.append('images', file));

        const uploadRes = await fetch('http://{import.meta.env.VITE_API_URL}/api/properties/upload', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${storedUser.token}` },
          body: imgFormData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          uploadedUrls = uploadData.urls || [];
        } else {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.message || 'Image upload failed on the server');
        }
      }

      const postData = { ...formData, images: uploadedUrls };

      const res = await fetch('http://{import.meta.env.VITE_API_URL}/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedUser.token}`
        },
        body: JSON.stringify(postData)
      });

      if (res.ok) {
        alert('Property posted successfully!');
        setFormData({
          apartmentName: '', city: '', area: '', streetAddress: '', rent: '', bhkType: '1BHK',
          furnishing: 'unfurnished', preference: 'any', contactNumber: ''
        });
        setSelectedImages([]);
        setActiveTab('properties');
        fetchProperties();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to post property.');
      }
    } catch (error) {
      console.error('Failed to post property', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVisitStatus = async (visitId, status) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`http://{import.meta.env.VITE_API_URL}/api/visits/${visitId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedUser.token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchVisits();
      }
    } catch (error) {
      console.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`http://{import.meta.env.VITE_API_URL}/api/properties/${deleteModal.propertyId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${storedUser.token}` }
      });
      if (res.ok) {
        fetchProperties();
        setDeleteModal({ isOpen: false, propertyId: null });
      } else {
        alert('Failed to delete property.');
      }
    } catch (error) {
      console.error('Error deleting property', error);
    }
  };

  const handleStatusChange = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const newStatus = statusModal.currentStatus === 'available' ? 'rented' : 'available';

      const res = await fetch(`http://{import.meta.env.VITE_API_URL}/api/properties/${statusModal.propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${storedUser.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        fetchProperties();
        setStatusModal({ isOpen: false, propertyId: null, currentStatus: '' });
      } else {
        alert('Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status', error);
    }
  };

  if (!user || user.role !== 'owner') {
    return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Access Denied. Owner only.</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <h1 className="heading-1" style={{ marginBottom: '2rem' }}>Owner Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => setActiveTab('properties')} className={activeTab === 'properties' ? 'btn-primary' : 'btn-outline'}>My Properties</button>
        <button onClick={() => setActiveTab('visits')} className={activeTab === 'visits' ? 'btn-primary' : 'btn-outline'}>Visit Requests</button>
        <button onClick={() => setActiveTab('post')} className={activeTab === 'post' ? 'btn-primary' : 'btn-outline'}>Post New Property</button>
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'properties' && (
          <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto' }}>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>My Properties</h2>
            {properties.length === 0 ? <p>No properties posted yet.</p> : (
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '800px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '1rem 0' }}>Apartment Name</th>
                    <th>Location</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Verified</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {p.images && p.images.length > 0 ? (
                            <img src={p.images[0]} alt="Property" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                          ) : (
                            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800" alt="Property Placeholder" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                          )}
                          <span>{p.apartmentName}</span>
                        </div>
                      </td>
                      <td>{p.city}, {p.area}</td>
                      <td>₹{p.rent?.toLocaleString('en-IN')}</td>
                      <td>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: p.status === 'available' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: p.status === 'available' ? '#10b981' : '#ef4444' }}>
                          {p.status}
                        </span>
                      </td>
                      <td>{p.verifiedByAdmin ? 'Yes' : 'No'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setStatusModal({ isOpen: true, propertyId: p._id, currentStatus: p.status })}
                            className="btn-outline"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                          >
                            Mark {p.status === 'available' ? 'Occupied' : 'Available'}
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, propertyId: p._id })}
                            className="btn-outline"
                            style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem', borderColor: '#ef4444', color: '#ef4444' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'visits' && (
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Visit Requests</h2>
            {visits.length === 0 ? <p>No visit requests yet.</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {visits.map(v => (
                  <div key={v._id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{v.propertyId?.apartmentName || 'Unknown Property'}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Requested by: {v.tenantId?.name} ({v.tenantId?.email})<br />
                        Date: {new Date(v.date).toLocaleDateString()} | Time: {v.time}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'uppercase', background: v.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : v.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: v.status === 'pending' ? '#f59e0b' : v.status === 'approved' ? '#10b981' : '#ef4444' }}>
                        {v.status}
                      </span>
                      {v.status === 'pending' && (
                        <>
                          <button onClick={() => handleVisitStatus(v._id, 'approved')} className="btn-outline" style={{ borderColor: '#10b981', color: '#10b981', padding: '0.4rem 0.8rem' }}>Approve</button>
                          <button onClick={() => handleVisitStatus(v._id, 'rejected')} className="btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.4rem 0.8rem' }}>Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'post' && (
          <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
            <h2 className="heading-2" style={{ marginBottom: '1.5rem' }}>Post New Property</h2>
            <form onSubmit={handlePostProperty} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Apartment Name</label>
                <input type="text" className="input-field" required value={formData.apartmentName} onChange={e => setFormData({ ...formData, apartmentName: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>City</label>
                <input type="text" list="city-suggestions" className="input-field" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="e.g. Bangalore" />
                <datalist id="city-suggestions">
                  <option value="Bangalore" />
                  <option value="Hyderabad" />
                  <option value="Mumbai" />
                  <option value="Pune" />
                  <option value="Delhi" />
                  <option value="Chennai" />
                  <option value="Kolkata" />
                  <option value="Ahmedabad" />
                </datalist>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Area</label>
                <input type="text" className="input-field" required value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} placeholder="e.g. Electronic City" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Full Street Address</label>
                <input type="text" className="input-field" required value={formData.streetAddress} onChange={e => setFormData({ ...formData, streetAddress: e.target.value })} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rent (₹/mo)</label>
                <input type="number" className="input-field" required value={formData.rent} onChange={e => setFormData({ ...formData, rent: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Contact Number</label>
                <input type="text" className="input-field" required value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>BHK Type</label>
                <select className="input-field" value={formData.bhkType} onChange={e => setFormData({ ...formData, bhkType: e.target.value })} style={{ cursor: 'pointer' }}>
                  <option value="1BHK" style={{ color: '#000' }}>1 BHK</option>
                  <option value="2BHK" style={{ color: '#000' }}>2 BHK</option>
                  <option value="3BHK" style={{ color: '#000' }}>3 BHK</option>
                  <option value="4BHK+" style={{ color: '#000' }}>4 BHK+</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Furnishing</label>
                <select className="input-field" value={formData.furnishing} onChange={e => setFormData({ ...formData, furnishing: e.target.value })} style={{ cursor: 'pointer' }}>
                  <option value="furnished" style={{ color: '#000' }}>Furnished</option>
                  <option value="semi-furnished" style={{ color: '#000' }}>Semi-Furnished</option>
                  <option value="unfurnished" style={{ color: '#000' }}>Unfurnished</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Property Images (Multiple)</label>
                <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="input-field" style={{ padding: '0.5rem' }} />

                {selectedImages.length > 0 && (
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
                    {selectedImages.map((file, idx) => (
                      <div key={idx} style={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(file)} alt={`Preview ${idx}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" disabled={isUploading} className="btn-primary" style={{ width: '100%', opacity: isUploading ? 0.7 : 1 }}>
                  {isUploading ? 'Uploading Images & Submitting...' : 'Submit Property for Verification'}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}
            >
              <h3 className="heading-2" style={{ marginBottom: '1rem' }}>Delete Property</h3>
              <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Are you sure you want to delete this property? This action cannot be undone.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteModal({ isOpen: false, propertyId: null })} className="btn-outline">Cancel</button>
                <button onClick={handleDelete} className="btn-primary" style={{ background: '#ef4444' }}>Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Change Confirmation Modal */}
      <AnimatePresence>
        {statusModal.isOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel"
              style={{ padding: '2rem', maxWidth: '400px', width: '90%' }}
            >
              <h3 className="heading-2" style={{ marginBottom: '1rem' }}>Change Property Status</h3>
              <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                Are you sure you want to mark this property as <strong style={{ color: '#fff' }}>{statusModal.currentStatus === 'available' ? 'Occupied' : 'Available'}</strong>?
                {statusModal.currentStatus === 'available' && ' It will be hidden from tenant search results.'}
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setStatusModal({ isOpen: false, propertyId: null, currentStatus: '' })} className="btn-outline">Cancel</button>
                <button onClick={handleStatusChange} className="btn-primary">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default OwnerDashboard;
