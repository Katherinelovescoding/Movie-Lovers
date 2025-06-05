const mongoose = require('mongoose');

const recommendedMovieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,
    trim: true
  },
  poster: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('recommended_movies', recommendedMovieSchema);
 