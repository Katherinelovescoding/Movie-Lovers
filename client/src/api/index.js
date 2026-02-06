import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// ============ Auth APIs ============
export const checkAuth = () => 
  api.get('/auth/check');

export const login = (username, password) => 
  api.post('/auth/login', { username, password });

export const register = (username, password) => 
  api.post('/auth/register', { username, password });

export const logout = () => 
  api.post('/auth/logout');

// ============ User APIs ============
export const getUsers = () => 
  api.get('/users');

export const getSavedWatchlists = () => 
  api.get('/user/savedWatchlists');

export const getMyCreatedWatchlists = () => 
  api.get('/user/myCreatedWatchlists');

// ============ Home APIs ============
export const getHomeData = () => 
  api.get('/home');

export const getRecommendedMovies = () => 
  api.get('/recommendedMovies');

// ============ Watchlist APIs ============
export const getAllWatchlists = () => 
  api.get('/watchlists');

export const getWatchlist = (id) => 
  api.get(`/watchlist/${id}`);

export const getWatchlistMovies = (id) => 
  api.get(`/watchlist/${id}/movies`);

export const createWatchlist = (listName) => 
  api.post('/watchlist/create', { listName });

export const addMovieToWatchlist = (collectionID, movie) => 
  api.post(`/watchlist/${collectionID}/addMovie`, { collectionID, ...movie });

export const removeMovieFromWatchlist = (watchlistId, movieId) => 
  api.post(`/watchlist/${watchlistId}/removeMovie`, { movieId });

export const toggleWatchlistVisibility = (id) => 
  api.post(`/watchlist/${id}/toggleVisibility`);

export const saveWatchlist = (watchlistId) => 
  api.post('/watchlist/save', { watchlistId });

export const unsaveWatchlist = (watchlistId) => 
  api.post('/watchlist/unsave', { watchlistId });

// ============ Explore APIs ============
export const getPublicWatchlists = () => 
  api.get('/explore');

export const getPublicWatchlistsSorted = (sort = 'newest') => 
  api.get(`/explore/sorted?sort=${sort}`);

export const searchPublicWatchlists = (keyword) => 
  api.get(`/explore/search?keyword=${encodeURIComponent(keyword)}`);

// ============ Movie APIs ============
export const searchMovie = (query) => 
  api.get(`/movies/search/${encodeURIComponent(query)}`);

export const searchMoviesOMDB = (params) => {
  const queryString = new URLSearchParams(params).toString();
  return api.get(`/movies/omdb?${queryString}`);
};

export const getMovieDetail = (imdbID) => 
  api.get(`/movie/${imdbID}`);

export default api;
