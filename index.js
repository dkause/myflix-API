/**
 * @fileoverview This file contains the implementation of a RESTful API for a movie database.
 * It uses Express.js for routing, Mongoose for database connection, and Passport.js for authentication.
 * The API provides endpoints for retrieving movies, genres, directors, and users, as well as adding and removing movies from a user's favorites list.
 * It also supports user registration and updating user information.
 * @module index.js
 * @requires mongoose
 * @requires ./models.js
 * @requires express
 * @requires express-validator
 * @requires body-parser
 * @requires uuid
 * @requires cors
 * @requires ./auth.js
 * @requires passport
 * @requires ./passport.js
 */

const mongoose = require('mongoose')
const Models = require('./models.js')
const express = require('express')
const { check, validationResult } = require('express-validator')

const Movies = Models.Movie
const Users = Models.User

mongoose
  .connect(
    'mongodb+srv://dkause:ksOTsgxwTtF2X7sF@kausedb.qpgk51c.mongodb.net/myflix?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    console.log('kauseDB Connected')
  })
  .catch((error) => {
    console.error('kauseDB connection Error: ' + error)
  })
;(bodyParser = require('body-parser')), (uuid = require('uuid'))

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const cors = require('cors')

// Allow only certain domains
let allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:8080',
  'http://localhost:1234',
  'http://testsite.com',
  'https://movie-api-5rhq.onrender.com',
  'https://kause-myflix.netlify.app',
  'https://dkause.github.io'
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin is not found on the list of allowed origins
        let message =
          'The CORS policy for this does not allow access from origin ' + origin
        return callback(new Error(message), false)
      }
      return callback(null, true)
    }
  })
)

// import login from auth.js
let auth = require('./auth.js')(app)
const passport = require('passport')
require('./passport.js')

/**
 * Handles GET requests to the homepage.
 * This endpoint can be used to check if server is running or to intialize it.
 * Responds with a 'hello world' message
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @returns {String} 'hello world'
 */

app.get('/', (req, res) => {
  res.send('hello world')
})

/**
 * Handles GET requests to '/movies' route.
 * Requires authentication using JWT.
 * Retrieves a list of movies from the database and sends it as a JSON response.
 * Provides an error message if the request failes
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Array<Object>} An array of movie objects in JSON format.
 */

app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

/**
 * Handles GET requests to '/movies/:Title' route.
 * Requires authentification using JWT.
 * Returns a movie with the specified title from the database as a JSON response
 *  Responds with an error message if the request fails.
 * @param {Object} req - The request object containing the movie title parameter.
 * @param {string} req.params.Title - The title of the movie to retrieve.
 * @param {Object} res - The response object providing specific movie data as JSON.
 * @returns {Object} The movie object in JSON format.
 */

app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movies) => {
        res.json(movies)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

/**
 * Handles GET request to retrieve about a specific movie genre.
 * Requires JWT for authentication.
 * Returns JSON Data about a specific genre.
 * If the request fails returns an error message
 * @param {Object} req - The request object containing the genre parameter.
 * @param {string} req.params.Genre - The name of the genre to retrieve data for.
 * @param {Object} res - The response object providing JSON data about the genre.
 * @returns {Object} JSON data about the specified genre.
 */

app.get(
  '/movies/genre/:Genre',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.Name': req.params.Genre })
      .then((genre) => {
        res.json(genre.Genre)
        console.log(genre.Genre)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

/**
 * Handles GET request about a specific director.
 * Requires JWT for authentification
 * Returns JSON data about a specific director
 * If the th request fails, returns an error message
 * @param {Object} req - this GET request requires a parameter 'Name'
 * @param {string} req.params.Name - The name of the director to retrieve data for.
 * @param {Object} res - The response object providing JSON data about the director.
 * @returns {Object} JSON data about the specified director.
 */

app.get(
  '/movies/director/:Name',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.Name': req.params.Name })
      .then((directorName) => {
        res.json(directorName.Director)
        console.log(directorName)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

/**
 * Handles a GET Request to a list of all users.
 * Requires JWT for authentification
 * Returns a JSON object containing a list of all users.
 * Returns an error message if the request fails
 * @param {Object} req - this GET request demands only the url endpoint '/users'.
 * @param {Object} res - the response returns a JSON object containing a list of all users.
 * @returns {Object} A JSON object containing a list of all users.
 */
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)
/**
 * This POST request handles the registration or creation of a user in the database.
 * It checks if the user exists and validates if all necessary fields are provided in the request.
 * If the request fails the response is an error message.
 * If the user already exits the response is an 400 status code with the message 'Username already exits'.
 * If the user creation is sucessfull a status code 201 and the JSON user object is returned.
 * The password is hashed.
 * @param {Object} req - The request object containing the user registration data
 * @param {string} req.body.Username - The username to be registered. Only alphanumeric characters allowed and min five characters.
 * @param {string} req.body.Password - The password of the user to be generated
 * @param {string} req.body.Email - The Email of the user beeing generated.
 * @param {string} req.body.Birthday - Optional, the birthdate of the user being generated.
 * @param {Object} res - The response object
 * @returns {Object} A response containing details about the registration status and errors.
 */
// Register/Create a user
app.post(
  '/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  (req, res) => {
    // check the validation object for errors

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    // hash the password
    let hashedPassword = Users.hashPassword(req.body.Password)

    // check if the user exists
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + ' already exists')
        } else {
          //create the user
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then((user) => {
              res.status(201).json(user)
            })
            .catch((error) => {
              console.error(error)
              res.status(500).send('Error: ' + error)
            })
        }
      })
      .catch((error) => {
        console.error(error)
        res.status(500).send('Error: ' + error)
      })
  }
)
/**
 * This GET request returns data in JSON format about a specific user, identified by its name.
 * JWT is required for authentification
 * If the request fails an error message is returned.
 * @param {Object} req - The GET request contains the username
 * @param {string} req.params.Username - The name of the user to be queried.
 * @param {Object} res - The response contains data about the user in JSON
 * @returns {Object} JSOn response containing user data or an error message
 */
// Get a user by username
app.get(
  '/users/:Username',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOne({ Username: req.params.Username })
      .then((user) => {
        res.json(user)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)
/**
 * This handles a PUT request to update specific userdata.
 * The requirements for the username and if a JWT token exists are checked.
 * If the username is found in the database, the data is updated
 * The response is either a status code 200 on sucessful update or an error message.
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user to be updated.
 * @param {string} req.body.Username - The new username for the user.
 * @param {string} req.body.Password - The new password for the user.
 * @param {string} req.body.Email - The new email address for the user.
 * @param {string} [req.body.Birthday] - The new birthday for the user (optional).
 * @param {Object} res - The response object.
 * @returns {Object} A response object containing either the updated user data or an error message.
 */

// Update User by Name
app.put(
  '/users/:Username',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check(
      'Username',
      'Username contains non-alphanumeric characters.'
    ).isAlphanumeric()
  ],
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    let hashedPassword = Users.hashPassword(req.body.Password)

    Users.findOneAndUpdate(
      { Username: req.params.Username },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true } // This line makes sure that the updated document is returned
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)
/**
 * This handles a DELETE request to delete specific user identfied by their name and ID.
 * The requirements are a JWT token and an existing user.
 * If the username is found in the database, the user is deleted.
 * The response is either a status code 200 on sucessful delete or a status code 400 if the user does not exists.
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user to be deleted.
 * @param {string} req.params._id - The Id if the user to be deleted.
 * @param {Object} res - The response object.
 * @returns {Object} A response object containing either a success message on deletion or an error message.
 */
// Delete User by Name
app.delete(
  '/users/:Username/:_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found.')
        } else {
          res.status(200).send(req.params.Username + ' was deleted.')
        }
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)
/**
 * Handles a POST request to add a movie to the user's favorite list.
 * Requires a JWT Token for authentificaion.
 * Adds the specified movie to the favorites list of the user.
 * Responds with the updated user object containing the new favorites list
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieId - The ID of the movie to be added to favorites.
 * @param {Object} res - The response object.
 * @returns {Object} A response object containing the updated user object with the added movie to favorites or an error message.
 */
// Add a movie to favorites list
app.post(
  '/users/:Username/movies/:MovieId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $push: { FavoriteMovies: req.params.MovieId } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)
/**
 * Handles a DELETE request to add a movie to the user's favorite list.
 * Requires a JWT Token for authentification.
 * Delets the specified movie to the favorites list of the user.
 * Responds with the updated user object containing the updated favorites list
 * @param {Object} req - The request object.
 * @param {string} req.params.Username - The username of the user.
 * @param {string} req.params.MovieId - The ID of the movie to be deleted to favorites.
 * @param {Object} res - The response object.
 * @returns {Object} A response object containing the updated user object without the deleted movie from favorites or an error message.
 */

// Delete a movie from favorites list
app.delete(
  '/users/:Username/movies/:MovieId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.Username },
      { $pull: { FavoriteMovies: req.params.MovieId } },
      { new: true }
    )
      .then((updatedUser) => {
        res.json(updatedUser)
        console.log(updatedUser)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)
/**
 * This GET Request provides a movie description identified by the movie title.
 * Requires a JWT token for authentification.
 * Returns the movie description in JSON format if found, otherwise returns an error message.
 * @param {Object} req - The request object.
 * @param {string} req.params.Title - The title of the movie to be queried.
 * @param {Object} res - The response object.
 * @returns {Object} - A response object containing the movie description or an error message.
 */
// Get a Movie Description by Name
app.get(
  '/movies/:Title',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.Title })
      .then((movies) => {
        res.json(movies)
      })
      .catch((err) => {
        console.error(err)
        res.status(500).send('Error: ' + err)
      })
  }
)

/**
 * Starts the server to listen on a specified port and IP address.
 * If the PORT environment variable is set, the server listens on that port.
 * Otherwise, it defaults to port 8080.
 * @param {number} port - The port number on which the server will listen.
 * @param {string} [ipAddress='0.0.0.0'] - The IP address to bind the server to. Defaults to '0.0.0.0'.
 * @param {Function} callback - A function to be executed once the server starts listening.
 */

const port = process.env.PORT || 8080

app.listen(port, '0.0.0.0', () => {
  console.log('Your app is listening on port ' + port)
})

/**
 * Error handling middleware used to catch and handle errors in the application.
 * If an error occurs during request processing, it logs the error stack trace and sends a 500 Internal Server Error response.
 * @param {Error} err - The error object representing the caught error.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the request-response cycle.
 */

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
