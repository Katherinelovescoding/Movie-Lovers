import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth APIs
export const login = (username, password) => 
  api.post('/login', { username, password });

export const register = (username, password) => 
  api.post('/register', { username, password });

export const getUsername = () => 
  api.get('/getUsername');

// Watchlist APIs
export const getMyWatchlists = () => 
  api.get('/user/myCreatedWatchlists');

export const getSavedWatchlists = () => 
  api.get('/user/savedWatchlists');

export const createWatchlist = (listName) => 
  api.post('/createNewList', { listName });

export const getWatchlist = (id) => 
  api.get(`/watchlist/${id}`);

export const addMovieToWatchlist = (collectionID, movie) => 
  api.post('/add_movie_to_watchlist', { collectionID, ...movie });

export const removeMovieFromWatchlist = (watchlistId, movieId) => 
  api.post(`/watchlist/${watchlistId}/removeMovie`, { movieId });

export const toggleWatchlistVisibility = (id) => 
  api.post(`/watchlist/${id}/toggleVisibility`);

export const saveWatchlist = (watchlistId) => 
  api.post('/saveWatchlist', { watchlistId });

export const unsaveWatchlist = (watchlistId) => 
  api.post('/unsaveWatchlist', { watchlistId });

// Explore APIs
export const getPublicWatchlists = (sort = 'newest') => 
  api.get(`/explore?sort=${sort}`);

export const searchPublicWatchlists = (keyword) => 
  api.get(`/searchPublicWatchlists?keyword=${keyword}`);

// Movie APIs
export const searchMovie = (query) => 
  api.get(`/movies/${encodeURIComponent(query)}`);

export const getMovieDetail = (imdbID) => 
  api.get(`/movie/${imdbID}`);

export const getRecommendedMovies = () => 
  api.get('/recommendedMovies');

export default api;

