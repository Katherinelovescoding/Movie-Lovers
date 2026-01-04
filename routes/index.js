const url = require('url');
const axios = require('axios');
const User = require('../models/User');
const Movie = require('../models/Movie');
const RecommendedMovie = require('../models/RecommendedMovie');
const Watchlist = require('../models/Watchlist'); 
const path = require('path');
const { validate } = require('../models/Watchlist');

const OMDB_API_KEY = process.env.OMDB_API_KEY || '6ea0b62b';

exports.clientLogin = (request, response) => {
    if (request.session.authenticated) {
        response.redirect('/index.html');
    }
    else {
        response.render('login', {
            title: 'Movie Lovers Login',
            body: 'Movie Lovers',
            header: ' Login',
            scriptPath: '/script.js',
            useLogin: true
        })
    }
}

exports.login = async function (request, response) {
  const username = request.body.username;
  const password = request.body.password;

  if (!username || !password) {
    console.log('empty fields');
    return response.status(400).json({ validated: false, message: 'Empty username or password' });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return response.json({ validated: false });
    }

    const isMatch = await user.comparePassword(password);

    if (isMatch) {
      request.session.authenticated = true;
      request.session.username = user.username;
      request.session.user_role = user.type;
      request.session.userId = user._id;
      console.log(user);

      request.session.save((err) => {
        if (err) {
          console.error(err);
          return response.status(500).send('Error saving session');
        }
        response.json({ validated: true, newPage: '/index.html' });
      });
    } else {
      response.json({ validated: false });
    }
  } catch (err) {
    console.error(err);
    response.status(500).send('Error logging in');
  }
};

exports.clientRegister = (request, response) => {
    if (request.session.authenticated) {
        response.redirect('/index.html');
    } else {
        response.render('register', {
            title: 'Register New Account for Movie Lovers',
            header: 'Create New Account',
            scriptPath: '/register.js',
            useLogin: false
        })
    }
}

exports.register = async function (request, response) {
    const username = request.body.username;
    const password = request.body.password;

    if (!username || !password) {
        console.log('empty fields');
        return response.status(400).json({validate:false, message:'Empty username or password'});
    }
    try {
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return response.status(400).send('User already exists');
        }

        const newUser = new User({
            username: username,
            password: password,
            type: 'guest' 
    });

    await newUser.save();

    response.status(200).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Error registering user:', err);
    response.status(500).send('Error registering user');
  }
}

exports.users = async function(request, response) {
    if (!request.session.authenticated) {
        return response.redirect('/login');
    }

    if (request.session.type !== 'admin') {
        return response.status(403).send('You are not authorized to view this page');
    }

    try {
        const users = await User.find({}, 'username password type');
        response.render('users', {
            title: 'Users:',
            userEntries: users
        });
    } catch (error) {
        console.error(error);
        response.status(500).send('Error retrieving users');
  }
}


exports.index = async function (request, response) {
    console.log('index function called');
    try {
        const movies = await RecommendedMovie.find({});
        console.log('# Found Movies：', movies.length);
        console.log('Record:', movies[0]);
        response.render('index', {
            body: 'Movie Lovers',
            username: request.session.username,
            movies: movies
        });
    } catch (err) {
        console.error('Error in index route:', err);
        response.render('index', {
            body: 'Movie Lovers',
            user: request.session.username,
            movies: []
        });
    }
}

function parseURL(request, response) {
    const PARSE_QUERY = true //parseQueryStringIfTrue
    const SLASH_HOST = true //slashDenoteHostIfTrue
    let urlObj = url.parse(request.url, PARSE_QUERY, SLASH_HOST)
    console.log('path:')
    console.log(urlObj.path)
    console.log('query:')
    console.log(urlObj.query)
    //for(x in urlObj.query) console.log(x + ': ' + urlObj.query[x])
    return urlObj
}

exports.createNewList = async function (request, response) {
    const userId = request.session.userId;
    const listName = request.body.listName;

    if (!listName || !userId) {
        return response.status(400).json({ success: false, message: 'Missing list name or user session' });
    }

    try {
        const existing = await Watchlist.findOne({ owner: userId, name: listName });

        if (existing) {
            console.log("Watchlist already exists");
            return response.status(409).json({ success: false, message: 'Watchlist already exists' });
        }

        const newList = new Watchlist({
            name: listName,
            owner: userId,
            movies: [],
            isPublic: false
        });

        await newList.save();

        response.status(200).json({ 
          success: true, 
          message: 'List created successfully',
          watchlistId: newList._id
        });
    } catch (error) {
        console.error('Error creating new list:', error);
        response.status(500).json({ success: false, message: 'Internal server error' });
    }
}

exports.getWatchlists = async function (request, response) {
    console.log('🔍 Session:', request.session);
    const userId = request.session.userId;

    if (!userId) {
        return response.redirect('/login');
    }

    try {
        const createdLists = await Watchlist.find({ owner: userId }).populate('movies');

        const user = await User.findById(userId).populate({
            path: 'savedWatchlists',
            populate: { path: 'movies' }
        });

        const savedLists = user.savedWatchlists || [];

        response.render('mywatchlists', { createdLists, savedLists });
    } catch (error) {
        console.error('Error retrieving watchlists:', error);
        response.status(500).render('error', { message: 'Failed to retrieve watchlists' });
    }
};



exports.requireLogin = function (req, res, next) {
    if (req.session.authenticated) {
        next(); // allow the next route to run
    } else {
        // require the user to log in
        res.redirect("/login"); // or render a login form, etc.
    }
}

exports.getWatchlist = async function (request, response) {
  const userId = request.session.userId;
  const collectionID = request.params.id;

  try {
    // Try to find as owner first, then as public watchlist
    let watchlist = await Watchlist.findOne({ _id: collectionID, owner: userId }).populate('movies');
    let isOwner = true;
    
    if (!watchlist) {
      // Not owner, try to find public watchlist
      watchlist = await Watchlist.findOne({ _id: collectionID, isPublic: true }).populate('movies');
      isOwner = false;
    }

    if (!watchlist) {
      return response.status(404).json({ success: false, message: 'Watchlist not found' });
    }

    const user = await User.findById(request.session.userId);
    const isSaved = user ? user.savedWatchlists.includes(watchlist._id.toString()) : false;

    // Return JSON for API requests
    if (request.headers.accept?.includes('application/json') || request.xhr) {
      return response.json({
        success: true,
        _id: watchlist._id,
        name: watchlist.name,
        listName: watchlist.name,
        movies: watchlist.movies,
        watchlistId: watchlist._id,
        showDelete: isOwner,
        isSaved,
        isPublic: watchlist.isPublic,
        isOwner
      });
    }

    // Render template for browser requests
    response.render('watchlist', {
        listName: watchlist.name,
        movies: watchlist.movies,
        watchlistId: watchlist._id,
        showDelete: isOwner,
        isSaved,
        isPublic: watchlist.isPublic,
        isOwner
    });
  } catch (error) {
    console.error('Error retrieving watchlist:', error);
    response.status(500).json({ success: false, message: 'Error retrieving watchlist' });
  }
}

exports.addMovieToList = async function (request, response) {
  const userId = request.session.userId;
  const collectionID = request.body.collectionID;

  const {
    imdbID,
    title,
    year,
    poster,
    director
  } = request.body;

  if (!userId || !collectionID) {
    return response.status(400).json({ success: false, message: 'Missing user session or collection ID' });
  }

  try {
    const watchlist = await Watchlist.findOne({ _id: collectionID, owner: userId });

    if (!watchlist) {
      return response.status(404).json({ success: false, message: 'Watchlist not found or unauthorized' });
    }

    let movie = await Movie.findOne({imdbID});

    if (!movie) {
        movie = new Movie({imdbID, title, year, director, poster});
        await movie.save();
    }

    const alreadyInList = watchlist.movies.includes(movie._id);
    if (alreadyInList) {
      return response.status(409).json({ success: false, message: 'Movie already exists in watchlist' });
    }

    watchlist.movies.push(movie._id);
    await watchlist.save();
    response.status(200).json({ success: true, message: 'Movie added to watchlist' });
  } catch (error) {
    console.error('Error adding movie to watchlist:', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
}

exports.getWatchlistMovies = async function (request, response) {
  const listId = request.params.id;

  try {
    const watchlist = await Watchlist.findById(listId).populate('movies');

    if (!watchlist) {
      return response.status(404).send('Watchlist not found');
    }

    response.render('watchlist', {
      listName: watchlist.name,
      movies: watchlist.movies
    });
  } catch (error) {
    console.error('Error retrieving watchlist movies:', error);
    response.status(500).send('Error retrieving watchlist movies');
  }
}

// Get detailed movie info (from OMDB) for a given imdbID
exports.getMovieDetail = async function (request, response) {
  const imdbID = request.params.id;

  if (!imdbID) {
    return response.status(400).send('Missing movie id');
  }

  try {
    // Try to get cached/basic data from our DB
    const localMovie = await Movie.findOne({ imdbID });

    // Fetch full detail from OMDB
    const omdbUrl = `http://www.omdbapi.com/?i=${encodeURIComponent(imdbID)}&plot=full&apikey=${OMDB_API_KEY}`;
    const omdbResp = await axios.get(omdbUrl);
    const data = omdbResp.data || {};

    if (data.Response !== 'True') {
      return response.status(404).render('error', { message: 'Movie not found' });
    }

    const detail = {
      imdbID,
      title: data.Title || localMovie?.title || '',
      year: data.Year || localMovie?.year || '',
      director: data.Director || localMovie?.director || '',
      poster: (data.Poster && data.Poster !== 'N/A') ? data.Poster : (localMovie ? localMovie.poster : ''),
      genre: data.Genre,
      runtime: data.Runtime,
      actors: data.Actors,
      plot: data.Plot,
      language: data.Language,
      country: data.Country,
      awards: data.Awards,
      imdbRating: data.imdbRating,
      metascore: data.Metascore
    };

    response.render('movie-detail', detail);
  } catch (error) {
    console.error('Error retrieving movie detail:', error);
    response.status(500).render('error', { message: 'Failed to retrieve movie detail' });
  }
}

// Allow a user to save (bookmark) a public watchlist created by another user
exports.saveWatchlist = async function (request, response) {
  const userId = request.session.userId;
  const watchlistId = request.body.watchlistId;

  if (!userId || !watchlistId) {
    return response.status(400).json({ success: false, message: 'Missing user ID or watchlist ID' });
  }

  try {
    const watchlist = await Watchlist.findById(watchlistId);

    if (!watchlist || !watchlist.isPublic) {
      return response.status(403).json({ success: false, message: 'This watchlist is not public or does not exist' });
    }

    const user = await User.findById(userId);

    if (user.savedWatchlists.includes(watchlistId)) {
      return response.status(409).json({ success: false, message: 'You have already saved this watchlist' });
    }

    user.savedWatchlists.push(watchlistId);
    await user.save();

    response.status(200).json({ success: true, message: 'Watchlist saved successfully' });
  } catch (error) {
    console.error('Error saving watchlist:', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
}

/* 
Get all watchlists that the current user has saved/bookmarked.
The watchlists created by current user will be fetched by another function called "/myCreatedWatchlists".
*/
exports.getSavedWatchlists = async function (request, response) {
    const userId = request.session.userId;

    if (!userId) {
        return response.status(401).json({ success: false, message: 'User not authenticated' });
    }

    try {
        const user = await User.findById(userId).populate(
            {
                path: 'savedWatchlists',
                populate: {
                    path: 'movies',
                    model: 'Movie'
                }
            }
        );

        if (!user) {
            return response.status(404).json({ success: false, message: 'User not found' });
        }

        response.status(200).json({ success: true, savedLists: user.savedWatchlists });
    } catch (error) {
        console.error ('Error retrieving saved watchlists: ', error);
        response.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// Remove a watchlist from the user's saved/ bookmarked list
exports.unsaveWatchlist = async function (request, response) {
  const userId = request.session.userId;
  const watchlistId = request.body.watchlistId;

  if (!userId || !watchlistId) {
    return response.status(400).json({ success: false, message: 'Missing user or watchlist ID' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return response.status(404).json({ success: false, message: 'User not found' });
    }

    user.savedWatchlists.pull(watchlistId);
    await user.save();
    response.status(200).json({ success: true, message: 'Watchlist removed from saved list' });
  } catch (error) {
    console.error('Error unsaving watchlist:', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all watchlists created by the current user
exports.getMyCreatedWatchlists = async function (request, response) {
  const userId = request.session.userId;

  if (!userId) {
    return response.status(401).json({ success: false, message: 'User not authenticated' });
  }

  try {
    const watchlists = await Watchlist.find({ owner: userId }).populate('movies');
    response.status(200).json({ success: true, createdLists: watchlists });
  } catch (error) {
    console.error('Error retrieving created watchlists:', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all public watchlists created by other users
exports.explorePublicWatchlists = async function (request, response) {
  const userId = request.session.userId;

  try {
    const publicLists = await Watchlist.find({
      isPublic: true,
      owner: { $ne: userId }
    }).populate('movies');

    response.status(200).json({ success: true, publicLists });
  } catch (error) {
    console.error('Error retrieving public watchlists:', error);
    response.status(500).json({ success: false, message: 'Failed to retrieve public watchlists' });
  }
};

// Search public watchlists by keyword in title
exports.searchPublicWatchlists = async function (request, response) {
  const keyword = request.query.keyword || '';
  const userId = request.session.userId;

  try {
    const matchingLists = await Watchlist.find(
        {
            isPublic:true,
            owner: {$ne: userId},
            name: {$regex: keyword, $options: 'i'}
        }
    ).populate('movies');
    response.status(200).json({ success: true, publicLists: matchingLists });
  } catch (error) {
    console.error('Search error:', error);
    response.status(500).json({ success: false, message: 'Search failed' });
  }
};

// Allow users to remove a movie from the watchlist they created
exports.removeMovieFromWatchlist = async function (request, response) {
  const watchlistId = request.params.id;
  const movieId = request.body.movieId;
  const userId = request.session.userId;

  if (!userId) {
    return response.status(401).send('Unauthorized');
  }

  try {
    const watchlist = await Watchlist.findById(watchlistId);

    if (!watchlist) {
      return response.status(404).send('Watchlist not found');
    }

    if (!watchlist.owner.equals(userId)) {
      return response.status(403).send('You are not authorized to modify this watchlist');
    }

    watchlist.movies.pull(movieId);
    await watchlist.save();

    response.redirect(`/watchlist/${watchlistId}`);
  } catch (error) {
    console.error('Error removing movie:', error);
    response.status(500).send('Internal server error');
  }
};

exports.getRecommendedMovies = async function (req, res) {
    try {
        const movies = await RecommendedMovie.find({});
        res.status(200).json(movies);
    } catch (err) {
        console.error("Error fetching recommended movies:", err);
        res.status(500).send("Failed to fetch recommended movies");
    }
};

// Toggle watchlist public/private status
exports.toggleWatchlistVisibility = async function (request, response) {
  const userId = request.session.userId;
  const watchlistId = request.params.id;

  if (!userId) {
    return response.status(401).json({ success: false, message: 'User not authenticated' });
  }

  try {
    const watchlist = await Watchlist.findOne({ _id: watchlistId, owner: userId });

    if (!watchlist) {
      return response.status(404).json({ success: false, message: 'Watchlist not found or unauthorized' });
    }

    // Toggle the public status
    watchlist.isPublic = !watchlist.isPublic;
    await watchlist.save();

    response.status(200).json({ 
      success: true, 
      message: watchlist.isPublic ? 'Watchlist is now public!' : 'Watchlist is now private!',
      isPublic: watchlist.isPublic 
    });
  } catch (error) {
    console.error('Error toggling watchlist visibility:', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
};
