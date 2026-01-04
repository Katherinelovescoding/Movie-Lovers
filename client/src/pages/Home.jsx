import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchMovie } from '../api';
import MovieCard from '../components/MovieCard';
import './Home.css';

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Featured movies (hardcoded for demo)
  const featuredMovies = [
    { imdbID: 'tt0111161', title: 'The Shawshank Redemption', year: '1994', poster: 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_SX300.jpg' },
    { imdbID: 'tt0068646', title: 'The Godfather', year: '1972', poster: 'https://m.media-amazon.com/images/M/MV5BYTJkNGQyZDgtZDQ0NC00MDM0LWEzZWQtYzUzZDEwMDljZWNjXkEyXkFqcGc@._V1_SX300.jpg' },
    { imdbID: 'tt0468569', title: 'The Dark Knight', year: '2008', poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg' },
    { imdbID: 'tt0109830', title: 'Forrest Gump', year: '1994', poster: 'https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_SX300.jpg' },
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await searchMovie(searchQuery);
      if (response.data && response.data.Response !== 'False') {
        setSearchResults([response.data]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Your Next Favorite Movie</h1>
          <p>Create watchlists, explore recommendations, and share with friends</p>
          
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies by title or IMDb ID..."
              className="search-input"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </section>

      {/* Search Results */}
      {searched && (
        <section className="search-results">
          <h2>Search Results</h2>
          {searchResults.length > 0 ? (
            <div className="movies-grid">
              {searchResults.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="no-results">No movies found. Try a different search term.</p>
          )}
        </section>
      )}

      {/* Featured Movies */}
      <section className="featured">
        <div className="section-header">
          <h2>Featured Movies</h2>
          <p>Popular picks to get you started</p>
        </div>
        <div className="movies-grid">
          {featuredMovies.map((movie) => (
            <MovieCard key={movie.imdbID} movie={movie} />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <Link to="/my-watchlists" className="action-card">
          <span className="action-icon">📝</span>
          <h3>My Watchlists</h3>
          <p>Manage your movie collections</p>
        </Link>
        <Link to="/explore" className="action-card">
          <span className="action-icon">🔍</span>
          <h3>Explore</h3>
          <p>Discover public watchlists</p>
        </Link>
      </section>
    </div>
  );
}

export default Home;

