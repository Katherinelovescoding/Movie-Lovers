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
    // index.html
    try {
        //response.send('Hello, world!');
        //response.render('test');
        response.render('index', {
            //title: 'COMP 2406 Final Project',
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

exports.createNewList = function (request, response) {
    const userName = request.session.username;
    const listName = request.body.listName;

    db.get("SELECT * FROM collections WHERE owner = ? AND collection_name = ?", [userName, listName], function (err, row) {
        if (err) {
            console.error(err);
        } else if (row) {
            console.log("Watchlist already exists");
        } else {
            db.run("INSERT INTO collections (owner, collection_name) VALUES (?, ?)", [userName, listName], function (err) {
                if (err) {
                    console.error(err);
                    response.status(500).send('Error creating new list');
                    return;
                } else {
                    response.json({ success: true, message: 'List created successfully' });
                }
            });
        }
    });
}

exports.getWatchlists = function (req, res) {
    const userName = req.session.username;
    db.all("SELECT * FROM collections WHERE owner = ?", [userName], function (err, rows) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving watchlists');
        } else {
            res.json(rows);
        }
    });
}


exports.requireLogin = function (req, res, next) {
    if (req.session.authenticated) {
        next(); // allow the next route to run
    } else {
        // require the user to log in
        res.redirect("/login"); // or render a login form, etc.
    }
};

exports.getWatchlist = function (req, res) {
    const userName = req.session.username;
    const collectionID = req.params.id;

    db.get("SELECT * FROM collections WHERE owner = ? AND id = ?", [userName, collectionID], function (err, row) {
        if (err) {
            console.error(err);
            res.status(500).send('Error retrieving watchlist');
        } else if (row) {
            db.all("SELECT * FROM all_movies WHERE collection_id = ?", [collectionID], function (err, rows) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error retrieving movies');
                } else {
                    res.render('watchlist', {
                        title: 'Watchlist',
                        listName: row.collection_name,
                        movies: rows
                    });
                }
            });
        } else {
            res.status(404).send('Watchlist not found');
        }
    });
};

exports.addMovieToList = function (req, res) {
    const userName = req.session.username;
    const collectionID = req.body.collectionID;
    const imdbID = req.body.imdbID;
    const title = req.body.title;
    const year = req.body.year;
    const poster = req.body.poster;
    const director = req.body.director;

    db.get("SELECT * FROM collections WHERE owner = ? AND id = ?", [userName, collectionID], function (err, row) {
        if (err) {
            console.error(err);
            res.status(500).send('Error checking for watchlist');
            return;
        }

        if (row) {
            db.run("INSERT INTO all_movies (collection_id, movie_title,imdb_id, year, director, poster) VALUES (?, ?, ?, ?, ?, ?)", [collectionID, title, imdbID, year, director, poster], function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error adding movie to watchlist');
                    return;
                }

                res.json({ success: true, message: 'Movie added to watchlist' });
            });
        } else {
            res.status(404).send('Watchlist not found');
        }
    });
}

exports.getWatchlistMovies = function (req, res) {
    var id = req.params.id;

    // Fetch the movies for the watchlist with the specified id
    // This will depend on how your data is structured
    var movies = db.run("SELECT * FROM all_movies WHERE collection_id = ?", [id]);

    var listName = db.run("SELECT collection_name FROM collections WHERE id = ?", [id]);

    // Render a view with the movie information
    res.render('watchlist', {
        listName: listName,
        movies: movies
    });
};