import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchMovie } from '../api';
import './MovieDetail.css';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMovie();
  }, [id]);

  const fetchMovie = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch full movie details from OMDB via our API
      const response = await searchMovie(id);
      
      if (response.data && response.data.Response !== 'False') {
        setMovie(response.data);
      } else {
        setError('Movie not found');
      }
    } catch (err) {
      console.error('Error fetching movie:', err);
      setError('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="movie-detail">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail">
        <div className="error-state">
          <h2>{error || 'Movie not found'}</h2>
          <button onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  const posterUrl = movie.Poster && movie.Poster !== 'N/A' 
    ? movie.Poster 
    : 'https://via.placeholder.com/400x600?text=No+Poster';

  return (
    <div className="movie-detail">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="detail-content">
        <div className="poster-section">
          <img src={posterUrl} alt={movie.Title} className="poster" />
        </div>

        <div className="info-section">
          <h1>{movie.Title}</h1>
          
          <div className="meta-row">
            <span className="year">{movie.Year}</span>
            {movie.Rated && movie.Rated !== 'N/A' && (
              <span className="rated">{movie.Rated}</span>
            )}
            {movie.Runtime && movie.Runtime !== 'N/A' && (
              <span className="runtime">{movie.Runtime}</span>
            )}
          </div>

          {movie.Genre && movie.Genre !== 'N/A' && (
            <div className="genres">
              {movie.Genre.split(', ').map((genre) => (
                <span key={genre} className="genre-tag">{genre}</span>
              ))}
            </div>
          )}

          {movie.imdbRating && movie.imdbRating !== 'N/A' && (
            <div className="ratings">
              <div className="rating-item">
                <span className="rating-label">IMDb Rating</span>
                <span className="rating-value">⭐ {movie.imdbRating}/10</span>
              </div>
              {movie.Metascore && movie.Metascore !== 'N/A' && (
                <div className="rating-item">
                  <span className="rating-label">Metascore</span>
                  <span className="rating-value metascore">{movie.Metascore}</span>
                </div>
              )}
            </div>
          )}

          {movie.Plot && movie.Plot !== 'N/A' && (
            <div className="plot">
              <h3>Plot</h3>
              <p>{movie.Plot}</p>
            </div>
          )}

          <div className="details-grid">
            {movie.Director && movie.Director !== 'N/A' && (
              <div className="detail-item">
                <span className="detail-label">Director</span>
                <span className="detail-value">{movie.Director}</span>
              </div>
            )}
            {movie.Writer && movie.Writer !== 'N/A' && (
              <div className="detail-item">
                <span className="detail-label">Writer</span>
                <span className="detail-value">{movie.Writer}</span>
              </div>
            )}
            {movie.Actors && movie.Actors !== 'N/A' && (
              <div className="detail-item">
                <span className="detail-label">Cast</span>
                <span className="detail-value">{movie.Actors}</span>
              </div>
            )}
            {movie.Language && movie.Language !== 'N/A' && (
              <div className="detail-item">
                <span className="detail-label">Language</span>
                <span className="detail-value">{movie.Language}</span>
              </div>
            )}
            {movie.Country && movie.Country !== 'N/A' && (
              <div className="detail-item">
                <span className="detail-label">Country</span>
                <span className="detail-value">{movie.Country}</span>
              </div>
            )}
            {movie.Awards && movie.Awards !== 'N/A' && (
              <div className="detail-item awards">
                <span className="detail-label">🏆 Awards</span>
                <span className="detail-value">{movie.Awards}</span>
              </div>
            )}
          </div>

          <div className="actions">
            <a 
              href={`https://www.imdb.com/title/${movie.imdbID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="imdb-link"
            >
              View on IMDb →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;


