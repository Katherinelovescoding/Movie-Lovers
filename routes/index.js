const url = require('url');
const User = require('../models/User');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/movie.db');

const path = require('path');
const { request } = require('http');
const { title } = require('process');
const exp = require('constants');
const { validate } = require('../models/Watchlist');

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
    const passowrd = request.body.password;

    if (!username || !passowrd) {
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


exports.index = function (request, response) {
    console.log('index function called');
    try {

        response.render('index', {
            body: 'Movie Lovers',
            user: request.session.username
        })
    } catch (err) {
        console.error(err);
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

        response.status(200).json({ success: true, message: 'List created successfully' });
    } catch (error) {
        console.error('Error creating new list:', error);
        response.status(500).json({ success: false, message: 'Internal server error' });
    }
}

exports.getWatchlists = async function (request, response) {
    const userId = request.session.userId;

    if (!userId) {
        return response.status(401).json({ success: false, message: 'User not authenticated' });
    }

    try {
        const watchlists = await Watchlist.find({ owner: userId }).populate('movies');
        response.status(200).json(watchlists);
    } catch (error) {
        console.error('Error retrieving watchlists:', error);
        response.status(500).json({ success: false, message: 'Failed to retrieve watchlists' });
  }
}


exports.requireLogin = function (req, res, next) {
    if (req.session.authenticated) {
        next(); // allow the next route to run
    } else {
        // require the user to log in
        res.redirect("/login"); // or render a login form, etc.
    }
};

exports.getWatchlist = async function (request, response) {
  const userId = request.session.userId;
  const collectionID = request.params.id;

  try {
    const watchlist = await Watchlist.findOne({ _id: collectionID, owner: userId }).populate('movies');

    if (!watchlist) {
      return response.status(404).send('Watchlist not found');
    }

    response.render('watchlist', {
      title: 'Watchlist',
      listName: watchlist.name,
      movies: watchlist.movies
    });
  } catch (error) {
    console.error('Error retrieving watchlist:', error);
    response.status(500).send('Error retrieving watchlist');
  }
};

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

    watchlist.movies.push(newMovie._id);
    await watchlist.save();
    response.status(200).json({ success: true, message: 'Movie added to watchlist' });
  } catch (error) {
    console.error('Error adding movie to watchlist:', error);
    response.status(500).json({ success: false, message: 'Internal server error' });
  }
};

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
};

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
};
