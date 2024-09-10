const http = require('http');
const express = require('express');
const session = require('express-session');
const path = require('path');
const hbs = require('hbs');
const axios = require('axios');

// read routes from routes/index.js
const routes = require('./routes/index')

const app = express();
const PORT = process.env.PORT || 3000

// view engine setup
hbs.registerPartials(__dirname + '/views/partials')
app.set('views', path.join(__dirname, 'views'))
//app.set('views', path.resolve(__dirname, '..', 'views'))
app.set('view engine', 'hbs') //use hbs handlebars wrapper

app.locals.pretty = true; //to generate pretty view-source code in browser


//app.use(routes.authenticate); //authenticate user

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // for parsing application/json
app.use(session({
    secret: 'kk1234',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}
))

//routes
app.get('/register', routes.clientRegister);
app.get('/login', routes.clientLogin);
app.get('/', routes.requireLogin, routes.index);
app.get('/index.html', routes.requireLogin, routes.index);
app.get('/users', routes.requireLogin, routes.users);
app.get('/user/watchlists', routes.requireLogin, routes.getWatchlists);
app.get('/getUsername', function (req, res) {
    res.json({ username: req.session.username });
});
app.get('/watchlist/:id', routes.requireLogin, routes.getWatchlist);
app.get('/watchlist/:id/movies', routes.getWatchlistMovies);

// get movie by IMDB ID
app.get('/movies/:id', (request, response) => {
    const idOrName = request.params.id;

    if (!idOrName) {
        response.json({ message: 'Please enter IMDb ID or movie name' });
        return;
    }

    // Check if the input is an IMDb ID or a movie name
    const isImdbID = /^tt\d+$/.test(idOrName);

    // Construct the URL based on the input
    const url = isImdbID
        ? `http://www.omdbapi.com/?i=${idOrName}&apikey=6ea0b62b`
        : `http://www.omdbapi.com/?t=${idOrName}&apikey=6ea0b62b`;

    axios.get(url)
        .then(apiResponse => {
            response.json(apiResponse.data);
        })
        .catch(error => {
            console.error('Error getting movie data:', error);
            response.status(500).json({ message: 'Error getting movie data' });
        });
});

app.post('/register', routes.register);
app.post('/login', routes.login);
app.post('/createNewList', routes.createNewList);
app.post('/add_movie_to_watchlist', routes.addMovieToList);
// app.post('/users', routes.adminUsers);

app.use(express.static('public'));

//start server
app.listen(PORT, err => {
    if (err) console.log(err)
    else {
        console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)
        console.log(`To Test:`)
        console.log('user: ginger password: 123456')
        console.log('http://localhost:3000/login')
        console.log('http://localhost:3000/register')
        console.log('http://localhost:3000/index.html')
        console.log('http://localhost:3000/users')
    }
})
