/**
 * @fileoverview This file contains the implementation of a RESTful API for a movie database.
 * It uses Express.js for routing, Mongoose for database connection, and Passport.js for authentication.
 * The API provides endpoints for retrieving movies, genres, directors, and users, as well as adding and removing movies from a user's favorites list.
 * It also supports user registration and updating user information.
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
 * @name  GET '/'
 * @description Handles GET requests to the homepage.<br>
 * This endpoint can be used to check if server is running or to intialize it.<br>
 * Responds with a 'hello world' message
 */
app.get('/', (req, res) => {
  res.send('hello world')
})

/**
 * @name GET '/movies'
 * @description Handles GET requests to '/movies' route.<br>
 * Requires authentication using JWT.<br>
 * Retrieves a list of movies from the database and sends it as a JSON response.<br>
 * Provides an error message if the request fails.
 * @example
 * Response data format
 * [
 * {"_id":ObjectID,
 * "Title":"",
 * "Description":"",
 * "Genre": ObjectID,
 * "Director":[ObjectID],
 * "ImagePath":"",
 * "Featured":boolean}
 * ]
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
 * @name GET '/movies/:Title'
 * @description Handles GET requests to '/movies/:Title' route.<br>
 * Requires authentification using JWT.<br>
 * Returns a movie with the specified title from the database as a JSON response.<br>
 * Responds with an error message if the request fails.
 * @example
 * Response data format
 * {"_id":ObjectID,
 * "Title":"",
 * "Description":"",
 * "Genre":
 * {"Name":"",
 * "Description":""},
 * "Director":{"Name":"",
 * "Bio":"","Birth":"","Death":""},"ImagePath":"","Featured":boolean}
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
 * @name  GET '/movies/genre/:Genre',
 * @description Handles GET request to retrieve about a specific movie genre.<br>
 * Requires JWT for authentication.<br>
 * Returns JSON Data about a specific genre.<br>
 * If the request fails returns an error message.<br>
 * @example
 * Request data format
 * {
 * "Name": ""
 * }
 * @example
 * Response data format
 * {
 * "id": ObjectID
 * "Name": "",
 * "Description": ""
 * }
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
 * @name  GET '/movies/director/:Name'
 * @description Handles GET request about a specific director.<br>
 * Requires JWT for authentification.<br>
 * Returns JSON data about a specific director.<br>
 * If the the request fails, returns an error message.
 * @example
 * Request data format
 * {
 * "Name" : ""
 * }
 * @example
 * Respnse data format
 * {
 * "_id": ObjectID,
 * "Name": "",
 * "Bio": "",
 * "Birth": Date,
 * "Death": Date
 * }
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
 * @name  GET '/users'
 * @description Handles a GET Request to a list of all users.<br>
 * Requires JWT for authentification.<br>
 * Returns a JSON object containing a list of all users.<br>
 * Returns an error message if the request fails.<br>
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
 * @name POST '/users'
 * @description This POST request handles the registration or creation of a user in the database.<br>
 * It checks if the user exists and validates if all necessary fields are provided in the request.<br>
 * If the request fails the response is an error message.<br>
 * If the user already exits the response is an 400 status code with the message 'Username already exits'.<br>
 * If the user creation is sucessfull a status code 201 and the JSON user object is returned.<br>
 * The password is hashed.
 * @example
 * Request data format
 * {"_id": ObjectID,
 * "Username":"",
 * "Password":"",
 * "Email":"",
 * "Birthday":"",
 * @example
 * Response data format
 *  {"_id": ObjectID,
 * "Username":"",
 * "Password":"",
 * "Email":"",
 * "Birthday":"",
 * "FavoriteMovies":[ObjectID],
 * }
 */
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
 * @name  GET '/users/:Username'
 * @description This GET request returns data in JSON format about a specific user, identified by its name.<br>
 * JWT is required for authentification.<br>
 * If the request fails an error message is returned.<br>
 * @example
 * Request data format
 * {
 * "Username":""
 * }
 * @example
 * Response data format
 *  {"_id": ObjectID,
 * "Username":"",
 * "Password":"",
 * "Email":"",
 * "Birthday":"",
 * "FavoriteMovies":[ObjectID],
 * }
 */
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
 * @name PUT '/users/:Username'
 * @description This handles a PUT request to update specific userdata.<br>
 * The requirements for the username and if a JWT token exists are checked.<br>
 * If the username is found in the database, the data is updated.<br>
 * The response is either a status code 200 on sucessful update or an error message.
 * @example
 * Request data format
 * {
 *  "Username": "",
 *  "Password": "",
 *  "Email": "",
 *  "Birthday:" ""
 * }
 * @example
 * Response data format
 ** {"_id": ObjectID,
 * "Username":"",
 * "Password":"",
 * "Email":"",
 * "Birthday":"",
 * "FavoriteMovies":[ObjectID],
 * }
 */
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
 * @name DELETE '/users/:Username/:_id'
 * @description This handles a DELETE request to delete specific user identfied by their name and ID.<br>
 * A JWT token is required and an existing user.<br>
 * If the username is found in the database, the user is deleted.<br>
 * The response is either a status code 200 on sucessful delete or a status code 400 if the user does not exists.<br>
 * @example
 * Request data format
 * {"_id": ObjectID,
 * "Username":""}
 * ,
 * token
 * @example
 * Response data format
 * 'Status 200 'Username was deleted.'
 */
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
 * @name POST '/users/:Username/movies/:MovieId'
 * @description Handles a POST request to add a movie to the user's favorite list.<br>
 * Requires a JWT Token for authentificaion.<br>
 * Adds the specified movie to the favorites list of the user.<br>
 * Responds with the updated user object containing the new favorites list.<br>
 * @example
 * Request data format
 * {
 * "Username": "",
 * "FavoriteMovies": ObjectID
 * }
 * @example
 * Response data format
 * {
 * "FavoriteMovies": [ObjectID]
 * }
 */
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
 * @name DELETE '/users/:Username/movies/:MovieId'
 * @description Handles a DELETE request to add a movie to the user's favorite list.<br>
 * Requires a JWT Token for authentification.<br>
 * Deletes the specified movie to the favorites list of the user.<br>
 * Responds with the updated user object containing the updated favorites list.<br>
 * @example
 * Request data format
 * {
 * "Username": "",
 * "FavoriteMovies": ObjectID
 * }
 * @example
 * Response data format
 * {
 * "FavoriteMovies": [ObjectID]
 * }
 */
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
 * @name GET '/movies/:Title'
 * @description This GET Request provides a movie description identified by the movie title.<br>
 * Requires a JWT token for authentification.<br>
 * Returns the movie description in JSON format if found, otherwise returns an error message.<br>
 * @example
 * Request data format
 * {
 * "Title": ""
 * }
 * @example
 * Response data format
 * {
 * "_id":ObjectID,
 * "Title":"",
 * "Description":"",
 * }
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
 * Starts the server to listen on a specified port and IP address.<br>
 * If the PORT environment variable is set, the server listens on that port.<br>
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
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})
