import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCreatedWatchlists, getSavedWatchlists, createWatchlist } from '../api';
import WatchlistCard from '../components/WatchlistCard';
import './MyWatchlists.css';

function MyWatchlists() {
  const [activeTab, setActiveTab] = useState('created');
  const [createdLists, setCreatedLists] = useState([]);
  const [savedLists, setSavedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    setLoading(true);
    try {
      const [createdRes, savedRes] = await Promise.all([
        getMyCreatedWatchlists(),
        getSavedWatchlists()
      ]);
      
      setCreatedLists(createdRes.data.createdLists || []);
      setSavedLists(savedRes.data.savedLists || []);
    } catch (error) {
      console.error('Error fetching watchlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async () => {
    const name = prompt('Enter a name for your new watchlist:');
    if (!name || !name.trim()) return;

    setCreating(true);
    try {
      const response = await createWatchlist(name.trim());
      if (response.data.success) {
        navigate(`/watchlist/${response.data.watchlistId}`);
      }
    } catch (error) {
      alert('Failed to create watchlist. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const currentLists = activeTab === 'created' ? createdLists : savedLists;

  return (
    <div className="my-watchlists">
      <div className="page-header">
        <h1>My Watchlists</h1>
        <button 
          className="create-btn" 
          onClick={handleCreateNew}
          disabled={creating}
        >
          {creating ? 'Creating...' : '+ Create New'}
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'created' ? 'active' : ''}`}
          onClick={() => setActiveTab('created')}
        >
          Created ({createdLists.length})
        </button>
        <button
          className={`tab ${activeTab === 'saved' ? 'active' : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          Saved ({savedLists.length})
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading watchlists...</p>
        </div>
      ) : currentLists.length > 0 ? (
        <div className="watchlists-grid">
          {currentLists.map((list) => (
            <WatchlistCard key={list._id} watchlist={list} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">📚</span>
          <h3>{activeTab === 'created' ? "You haven't created any watchlists yet" : "You haven't saved any watchlists yet"}</h3>
          <p>
            {activeTab === 'created' 
              ? 'Create a new watchlist to start organizing your favorite movies!'
              : 'Explore public watchlists and save ones you like!'}
          </p>
          {activeTab === 'created' ? (
            <button className="empty-action-btn" onClick={handleCreateNew}>
              Create Your First Watchlist
            </button>
          ) : (
            <button className="empty-action-btn" onClick={() => navigate('/explore')}>
              Explore Watchlists
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MyWatchlists;


