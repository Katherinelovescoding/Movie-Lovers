import { useState, useEffect } from 'react';
import { getPublicWatchlistsSorted, searchPublicWatchlists } from '../api';
import WatchlistCard from '../components/WatchlistCard';
import './Explore.css';

function Explore() {
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWatchlists();
  }, [sortBy]);

  const fetchWatchlists = async () => {
    setLoading(true);
    try {
      const response = await getPublicWatchlistsSorted(sortBy);
      // Handle both possible response formats
      if (response.data.publicLists) {
        setWatchlists(response.data.publicLists);
      } else if (Array.isArray(response.data)) {
        setWatchlists(response.data);
      } else {
        setWatchlists([]);
      }
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      setWatchlists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchWatchlists();
      return;
    }

    setLoading(true);
    try {
      const response = await searchPublicWatchlists(searchQuery);
      setWatchlists(response.data.publicLists || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="explore">
      <div className="explore-header">
        <div className="header-content">
          <h1>Explore Public Watchlists</h1>
          <p>Discover movie collections curated by the community</p>
        </div>
      </div>

      <div className="explore-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search watchlists by name..."
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="mostSaved">Most Saved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading watchlists...</p>
        </div>
      ) : watchlists.length > 0 ? (
        <div className="watchlists-grid">
          {watchlists.map((list) => (
            <WatchlistCard key={list._id} watchlist={list} showOwner />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h3>No public watchlists found</h3>
          <p>
            {searchQuery 
              ? 'Try a different search term'
              : 'Be the first to share your watchlist with the community!'}
          </p>
        </div>
      )}
    </div>
  );
}

export default Explore;


