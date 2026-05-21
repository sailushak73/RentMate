import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Map from '../../components/Map/Map';
import { Filter, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialCity = searchParams.get('city') || '';
  const initialArea = searchParams.get('area') || '';

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areaSuggestions, setAreaSuggestions] = useState([]);

  const [filters, setFilters] = useState({
    city: initialCity,
    area: initialArea,
    bhkType: '',
    furnishing: '',
    minRent: '',
    maxRent: '',
    preference: ''
  });

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties?${queryParams.toString()}`);
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error('Error fetching properties', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const query = filters.city ? `?city=${encodeURIComponent(filters.city)}` : '';
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/areas${query}`);
        const data = await res.json();
        setAreaSuggestions(data);
      } catch (error) {
        console.error('Error fetching areas', error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchAreas();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filters.city]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProperties();

    // Update URL
    const queryParams = new URLSearchParams();
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.area) queryParams.append('area', filters.area);
    navigate(`/search?${queryParams.toString()}`, { replace: true });
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 100px)' }}>
      {/* Sidebar Filters */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="glass-panel"
        style={{ width: '300px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
          <Filter size={20} className="text-gradient" />
          <h2 className="heading-2" style={{ fontSize: '1.5rem' }}>Filters</h2>
        </div>

        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>City</label>
            <input type="text" name="city" value={filters.city} onChange={handleFilterChange} className="input-field" placeholder="E.g. Bangalore" />
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Area / Locality (Optional)</label>
            <input
              type="text"
              name="area"
              value={filters.area}
              onChange={handleFilterChange}
              className="input-field"
              placeholder="E.g. Electronic City"
              list="area-suggestions"
            />
            <datalist id="area-suggestions">
              {areaSuggestions.map((area, idx) => (
                <option key={idx} value={area} />
              ))}
            </datalist>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>BHK Type</label>
            <select name="bhkType" value={filters.bhkType} onChange={handleFilterChange} className="input-field" style={{ cursor: 'pointer' }}>
              <option value="" style={{ color: '#000' }}>Any</option>
              <option value="1BHK" style={{ color: '#000' }}>1 BHK</option>
              <option value="2BHK" style={{ color: '#000' }}>2 BHK</option>
              <option value="3BHK" style={{ color: '#000' }}>3 BHK</option>
              <option value="4BHK+" style={{ color: '#000' }}>4 BHK+</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Furnishing</label>
            <select name="furnishing" value={filters.furnishing} onChange={handleFilterChange} className="input-field" style={{ cursor: 'pointer' }}>
              <option value="" style={{ color: '#000' }}>Any</option>
              <option value="furnished" style={{ color: '#000' }}>Furnished</option>
              <option value="semi-furnished" style={{ color: '#000' }}>Semi-Furnished</option>
              <option value="unfurnished" style={{ color: '#000' }}>Unfurnished</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Preference</label>
            <select name="preference" value={filters.preference} onChange={handleFilterChange} className="input-field" style={{ cursor: 'pointer' }}>
              <option value="" style={{ color: '#000' }}>Any</option>
              <option value="family" style={{ color: '#000' }}>Family</option>
              <option value="bachelor" style={{ color: '#000' }}>Bachelor</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Min Rent</label>
              <input type="number" name="minRent" value={filters.minRent} onChange={handleFilterChange} className="input-field" placeholder="₹0" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Max Rent</label>
              <input type="number" name="maxRent" value={filters.maxRent} onChange={handleFilterChange} className="input-field" placeholder="₹Max" />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Apply Filters</button>
        </form>
      </motion.div>

      {/* Main Content: Map & List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Map Container */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-panel"
          style={{ height: '40%', padding: '0.5rem' }}
        >
          <Map properties={properties} />
        </motion.div>

        {/* Results List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{ flex: 1, overflowY: 'auto', paddingRight: '1rem' }}
        >
          <h2 className="heading-2" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            {loading ? 'Searching...' : `${properties.length} Properties Found`}
          </h2>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <div className="loader" style={{ border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid var(--primary-color)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : properties.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.2)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Properties Found</h3>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
                We couldn't find any properties matching your search criteria. Try adjusting your filters or searching in a different area.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {!loading && properties.map((property) => (
                <div key={property._id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <span style={{ position: 'absolute', top: '2rem', right: '2rem', padding: '0.25rem 0.6rem', borderRadius: '4px', background: property.status === 'available' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                    {property.status === 'available' ? 'Available' : 'Rented'}
                  </span>
                  <div style={{
                    height: '160px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    backgroundImage: property.images && property.images.length > 0 ? `url(${property.images[0]})` : 'url(https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.25rem' }}>{property.apartmentName}</h3>
                  <p style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <MapPin size={14} /> {property.area}, {property.city}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {property.streetAddress}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{property.bhkType}</span>
                    <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{property.furnishing}</span>
                    <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>{property.preference}</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    📞 {property.contactNumber || (property.ownerId && property.ownerId.contactNumber)}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="text-gradient" style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{property.rent?.toLocaleString('en-IN')}<span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-secondary)' }}>/mo</span></span>
                    <button onClick={() => navigate(`/property/${property._id}`)} className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}>View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
};

export default Search;
