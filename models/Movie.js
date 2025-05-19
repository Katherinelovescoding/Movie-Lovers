const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  imdbID: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true
  },
  year: {
    type: String
  },
  director: {
    type: String
  },
  poster: {
    type: String
  }
});

module.exports = mongoose.model('Movie', movieSchema);
