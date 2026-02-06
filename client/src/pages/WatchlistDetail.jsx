import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getWatchlist, 
  searchMovie, 
  addMovieToWatchlist, 
  removeMovieFromWatchlist,
  toggleWatchlistVisibility,
  saveWatchlist,
  unsaveWatchlist 
} from '../api';
import MovieCard from '../components/MovieCard';
import './WatchlistDetail.css';

function WatchlistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [watchlist, setWatchlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, [id]);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const response = await getWatchlist(id);
      // The response is HTML in the current setup, we need to update the backend
      // For now, let's handle the JSON response format we'll create
      if (response.data) {
        setWatchlist(response.data);
        setIsOwner(response.data.isOwner || false);
        setIsSaved(response.data.isSaved || false);
        setIsPublic(response.data.isPublic || false);
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      // Try the alternate API endpoint
      navigate('/my-watchlists');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const response = await searchMovie(searchQuery);
      if (response.data && response.data.Response !== 'False') {
        setSearchResults([response.data]);
      } else {
        setSearchResults([]);
        alert('No movies found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMovie = async (movie) => {
    try {
      const response = await addMovieToWatchlist(id, {
        imdbID: movie.imdbID,
        title: movie.Title,
        year: movie.Year,
        poster: movie.Poster,
        director: movie.Director
      });

      if (response.data.success) {
        alert('Movie added to watchlist!');
        setSearchResults([]);
        setSearchQuery('');
        fetchWatchlist();
      } else {
        alert(response.data.message || 'Failed to add movie');
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert('This movie is already in the watchlist');
      } else {
        alert('Failed to add movie. Please try again.');
      }
    }
  };

  const handleRemoveMovie = async (movieId) => {
    if (!confirm('Remove this movie from the watchlist?')) return;

    try {
      await removeMovieFromWatchlist(id, movieId);
      fetchWatchlist();
    } catch (error) {
      alert('Failed to remove movie. Please try again.');
    }
  };

  const handleToggleVisibility = async () => {
    try {
      const response = await toggleWatchlistVisibility(id);
      if (response.data.success) {
        setIsPublic(response.data.isPublic);
        alert(response.data.message);
      }
    } catch (error) {
      alert('Failed to update visibility. Please try again.');
    }
  };

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await unsaveWatchlist(id);
        setIsSaved(false);
        alert('Watchlist removed from your saved list');
      } else {
        await saveWatchlist(id);
        setIsSaved(true);
        alert('Watchlist saved!');
      }
    } catch (error) {
      alert('Failed to update. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="watchlist-detail">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading watchlist...</p>
        </div>
      </div>
    );
  }

  if (!watchlist) {
    return (
      <div className="watchlist-detail">
        <div className="error-state">
          <h2>Watchlist not found</h2>
          <button onClick={() => navigate('/my-watchlists')}>Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="watchlist-detail">
      <div className="detail-header">
        <div className="header-info">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1>{watchlist.listName || watchlist.name}</h1>
          <div className="header-meta">
            <span className="movie-count">
              {watchlist.movies?.length || 0} movies
            </span>
            {isPublic && <span className="public-badge">Public</span>}
          </div>
        </div>

        <div className="header-actions">
          {isOwner ? (
            <button 
              className={`visibility-btn ${isPublic ? 'public' : ''}`}
              onClick={handleToggleVisibility}
            >
              {isPublic ? '🔓 Make Private' : '🔒 Make Public'}
            </button>
          ) : (
            <button 
              className={`save-btn ${isSaved ? 'saved' : ''}`}
              onClick={handleSaveToggle}
            >
              {isSaved ? '💖 Saved' : '🤍 Save Watchlist'}
            </button>
          )}
        </div>
      </div>

      {/* Search Section (only for owner) */}
      {isOwner && (
        <div className="search-section">
          <h3>Add Movies</h3>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by movie title or IMDb ID..."
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((movie) => (
                <div key={movie.imdbID} className="search-result-item">
                  <img 
                    src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/60x90?text=No+Poster'} 
                    alt={movie.Title}
                    className="result-poster"
                  />
                  <div className="result-info">
                    <h4>{movie.Title}</h4>
                    <p>{movie.Year} • {movie.Director || 'Unknown Director'}</p>
                  </div>
                  <button 
                    className="add-movie-btn"
                    onClick={() => handleAddMovie(movie)}
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Movies Grid */}
      {watchlist.movies && watchlist.movies.length > 0 ? (
        <div className="movies-grid">
          {watchlist.movies.map((movie) => (
            <MovieCard 
              key={movie._id} 
              movie={movie} 
              showRemove={isOwner}
              onRemove={handleRemoveMovie}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">🎬</span>
          <h3>No movies in this watchlist yet</h3>
          {isOwner && <p>Use the search above to add your favorite movies!</p>}
        </div>
      )}
    </div>
  );
}

export default WatchlistDetail;


