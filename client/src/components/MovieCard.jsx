import { Link } from 'react-router-dom';
import './MovieCard.css';

function MovieCard({ movie, onRemove, showRemove = false }) {
  const posterUrl = movie.poster && movie.poster !== 'N/A' 
    ? movie.poster 
    : 'https://via.placeholder.com/300x450?text=No+Poster';

  return (
    <div className="movie-card">
      <div className="movie-poster-container">
        <img 
          src={posterUrl} 
          alt={movie.title || movie.Title} 
          className="movie-poster"
        />
        <div className="movie-overlay">
          <Link to={`/movie/${movie.imdbID || movie.imdbId}`} className="view-details">
            View Details
          </Link>
        </div>
      </div>
      
      <div className="movie-info">
        <Link to={`/movie/${movie.imdbID || movie.imdbId}`} className="movie-title">
          {movie.title || movie.Title}
        </Link>
        <p className="movie-year">{movie.year || movie.Year}</p>
        {movie.director && <p className="movie-director">{movie.director}</p>}
        
        {showRemove && (
          <button 
            className="remove-btn"
            onClick={() => onRemove(movie._id)}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default MovieCard;


