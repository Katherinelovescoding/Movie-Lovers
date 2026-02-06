import { Link } from 'react-router-dom';
import './WatchlistCard.css';

function WatchlistCard({ watchlist, showOwner = false }) {
  const movieCount = watchlist.movies?.length || 0;
  const previewMovies = watchlist.movies?.slice(0, 4) || [];

  return (
    <Link to={`/watchlist/${watchlist._id}`} className="watchlist-card">
      <div className="watchlist-preview">
        {previewMovies.length > 0 ? (
          previewMovies.map((movie, index) => (
            <div key={movie._id || index} className="preview-poster">
              <img 
                src={movie.poster && movie.poster !== 'N/A' ? movie.poster : 'https://via.placeholder.com/100x150?text=No+Poster'} 
                alt={movie.title}
              />
            </div>
          ))
        ) : (
          <div className="empty-preview">
            <span>🎬</span>
            <p>No movies yet</p>
          </div>
        )}
      </div>
      
      <div className="watchlist-info">
        <h3 className="watchlist-name">{watchlist.name}</h3>
        <div className="watchlist-meta">
          <span className="movie-count">{movieCount} {movieCount === 1 ? 'movie' : 'movies'}</span>
          {showOwner && watchlist.owner?.username && (
            <span className="owner-name">by {watchlist.owner.username}</span>
          )}
        </div>
        {watchlist.isPublic && (
          <span className="public-badge">Public</span>
        )}
      </div>
    </Link>
  );
}

export default WatchlistCard;


