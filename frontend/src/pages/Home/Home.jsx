import React from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?city=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', maxWidth: '800px', marginBottom: '4rem' }}
      >
        <h1 className="heading-1" style={{ marginBottom: '1.5rem' }}>
          Find Your Perfect Home with <span className="text-gradient">RentMate</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', lineHeight: '1.6' }}>
          Discover premium apartments, flats, and houses for rent. Explore realistic details, schedule visits, and move in effortlessly.
        </p>

        <form onSubmit={handleSearch} className="glass-panel" style={{
          display: 'flex',
          padding: '0.5rem',
          borderRadius: '50px',
          alignItems: 'center',
          boxShadow: '0 0 40px rgba(59, 130, 246, 0.15)'
        }}>
          <MapPin style={{ color: 'var(--text-secondary)', marginLeft: '1rem' }} />
          <input
            type="text"
            placeholder="Search by city or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              padding: '1rem',
              fontSize: '1.1rem',
              outline: 'none'
            }}
          />
          <button type="submit" className="btn-primary" style={{ borderRadius: '50px', padding: '1rem 2rem' }}>
            <Search size={20} />
            Search
          </button>
        </form>
      </motion.div>


    </div>
  );
};

export default Home;
