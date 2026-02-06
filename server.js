const mongoose = require('mongoose');
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const axios = require('axios');

// Import models
const Watchlist = require('./models/Watchlist');

// read routes from routes/index.js
const routes = require('./routes/index')

const app = express();
const PORT = process.env.PORT || 3000

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log("✅ Connected to MongoDB Atlas");
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'kk1234',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

// ============ API Routes ============

// Auth routes
app.get('/api/auth/check', routes.checkAuth);
app.post('/api/auth/login', routes.login);
app.post('/api/auth/register', routes.register);
app.post('/api/auth/logout', routes.logout);

// User routes
app.get('/api/users', routes.requireLogin, routes.users);
app.get('/api/user/savedWatchlists', routes.requireLogin, routes.getSavedWatchlists);
app.get('/api/user/myCreatedWatchlists', routes.requireLogin, routes.getMyCreatedWatchlists);

// Home/Index data
app.get('/api/home', routes.requireLogin, routes.index);

// Watchlist routes
app.get('/api/watchlists', routes.requireLogin, routes.getWatchlists);
app.get('/api/watchlist/:id', routes.requireLogin, routes.getWatchlist);
app.get('/api/watchlist/:id/movies', routes.getWatchlistMovies);
app.post('/api/watchlist/create', routes.requireLogin, routes.createNewList);
app.post('/api/watchlist/:id/addMovie', routes.requireLogin, routes.addMovieToList);
app.post('/api/watchlist/:id/removeMovie', routes.requireLogin, routes.removeMovieFromWatchlist);
app.post('/api/watchlist/:id/toggleVisibility', routes.requireLogin, routes.toggleWatchlistVisibility);
app.post('/api/watchlist/save', routes.requireLogin, routes.saveWatchlist);
app.post('/api/watchlist/unsave', routes.requireLogin, routes.unsaveWatchlist);

// Movie routes (public - anyone can view movie details)
app.get('/api/movie/:id', routes.getMovieDetail);

// Explore routes (public - anyone can explore public watchlists)
app.get('/api/explore', routes.explorePublicWatchlists);
app.get('/api/explore/search', routes.searchPublicWatchlists);


// OMDB API proxy - search movies by ID or name
app.get('/api/movies/search/:idOrName', (request, response) => {
    const idOrName = request.params.idOrName;

    if (!idOrName) {
        return response.json({ message: 'Please enter IMDb ID or movie name' });
    }

    // Check if the input is an IMDb ID or a movie name
    const isImdbID = /^tt\d+$/.test(idOrName);
    const OMDB_API_KEY = process.env.OMDB_API_KEY || '6ea0b62b';

    // Construct the URL based on the input
    const url = isImdbID
        ? `http://www.omdbapi.com/?i=${idOrName}&apikey=${OMDB_API_KEY}`
        : `http://www.omdbapi.com/?t=${idOrName}&apikey=${OMDB_API_KEY}`;

    axios.get(url)
        .then(apiResponse => {
            response.json(apiResponse.data);
        })
        .catch(error => {
            console.error('Error getting movie data:', error);
            response.status(500).json({ message: 'Error getting movie data' });
        });
});

// OMDB API proxy - search movies by query string
app.get('/api/movies/omdb', async (req, res) => {
  const { s, i, t } = req.query;
  const OMDB_API_KEY = process.env.OMDB_API_KEY || '6ea0b62b';
  
  let url = `http://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;
  if (s) url += `&s=${encodeURIComponent(s)}`;
  if (i) url += `&i=${encodeURIComponent(i)}`;
  if (t) url += `&t=${encodeURIComponent(t)}`;

  try {
    const apiResponse = await axios.get(url);
    res.json(apiResponse.data);
  } catch (error) {
    console.error('OMDB API error:', error);
    res.status(500).json({ message: 'Error fetching from OMDB' });
  }
});

// API endpoint for recommended movies
app.get('/api/recommendedMovies', async (req, res) => {
  try {
    const RecommendedMovie = require('./models/RecommendedMovie');
    const movies = await RecommendedMovie.find({});
    res.json(movies);
  } catch (err) {
    console.error('Error fetching recommended movies:', err);
    res.status(500).json({ message: 'Failed to fetch recommended movies' });
  }
});

// Explore with sorting (public)
app.get('/api/explore/sorted', async (req, res) => {
  const sortBy = req.query.sort || 'newest';
  const userId = req.session.userId || null; // Allow null for unauthenticated users

  let sortOption = { createdAt: -1 };

  if (sortBy === 'oldest') {
    sortOption = { createdAt: 1 };
  } else if (sortBy === 'mostSaved') {
    sortOption = { createdAt: -1 }; // Fallback, need aggregation for true array length sort
  }

  try {
    const query = { isPublic: true };
    if (userId) {
      query.owner = { $ne: userId };
    }
    const lists = await Watchlist.find(query)
    .sort(sortOption)
    .populate('movies')
    .populate('owner', 'username');

    res.json({ 
      success: true,
      publicLists: lists, 
      currentSort: sortBy
    });
  } catch (err) {
    console.error('Error in explore route:', err);
    res.status(500).json({ success: false, message: 'Error loading explore data' });
  }
});

// ============ Static Files & React SPA ============

// Serve React build files
app.use(express.static(path.join(__dirname, 'client', 'dist')));

// Legacy static files (for any remaining public assets)
app.use(express.static('public'));

// Fallback: Serve React app for all non-API routes (React Router handles client-side routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, err => {
    if (err) console.log(err)
    else {
        console.log(`🚀 Server listening on port: ${PORT}`);
        console.log(`📱 React frontend: http://localhost:${PORT}`);
        console.log(`🔌 API base: http://localhost:${PORT}/api`);
        console.log(`\nPress CTRL+C to stop`);
    }
})
