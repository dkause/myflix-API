// created by Copilot edited by dkause

const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

/**
 * @fileoverview This file contains the movie schema for the myFlix API.
 * There are to collections: Movie and User
 * @module models
 */

/**
 * Represents a movie in the myFlix API.
 * @typedef {Object} Movie
 * @property {string} Titel - The title of the movie.
 * @property {string} Description - The description of the movie.
 * @property {Object} Genre - The genre of the movie.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - The description of the genre.
 * @property {Object} Director - The director of the movie.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Bio - The biography of the director.
 * @property {string[]} Actors - The actors in the movie.
 * @property {string} ImagePath - The path to the movie's image.
 * @property {boolean} Featured - Indicates if the movie is featured.
 */

/**
 * Represents the movie schema for the myFlix API.
 * @type {import('mongoose').Schema}
 */
let movieSchema = mongoose.Schema({
  Titel: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Director: {
    Name: String,
    Bio: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

/**
 * User schema for the myFlix application.
 * @typedef {Object} UserSchema
 * @property {string} Username - The username of the user. (required)
 * @property {string} Password - The password of the user. (required)
 * @property {string} Email - The email address of the user. (required)
 * @property {Date} Birthday - The birthday of the user.
 * @property {Array.<mongoose.Schema.Types.ObjectId>} FavoriteMovies - The favorite movies of the user.
 */
let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync (password, this.Password);
};

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
