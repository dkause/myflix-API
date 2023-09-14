const mongoose = require("mongoose");
const Models = require("./models.js");
const express = require("express");
const { check, validationResult } = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('
  mongodb+srv://dkause:ksOTsgxwTtF2X7sF@kausedb.qpgk51c.mongodb.net / kauseDB ? retryWrites = true & w=majority',
  console.log("MongoDB Connected"),
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

// mongoose.connect(
//   "mongodb://localhost:27017/myflix",
//   console.log("Mongoose Connected"),
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// );

(bodyParser = require("body-parser")), (uuid = require("uuid"));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');

// Allow only certain domains
let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin is not found on the list of allowed origins
      let message = 'The CORS policy for this does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');

/* URL ENDPOINTS*/

// Get a list of all Movies
app.get("/movies", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get data of a specific movie
app.get("/movies/:Title", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get data of a specific movie genre
app.get("/movies/genre/:Genre", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Genre })
    .then((genre) => {
      res.json(genre.Genre);
      console.log(genre.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// // Get data of a specific Director
app.get("/movies/director/:Name", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Name })
    .then((directorName) => {
      res.json(directorName.Director);
      console.log(directorName);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a list of all Users
app.get("/users", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Register/Create a user
app.post("/users", [check('Username', 'Username is required').isLength({ min: 5 }), check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(), check('Password', 'Password is required').not().isEmpty(), check('Email', 'Email does not appear to be valid').isEmail()], (req, res) => {
  // check the validation object for errors

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.Password);

  Users.findOne({ Name: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + " already exists");
      } else {
        Users.create({
          Name: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Get a user by username
app.get("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOne({ Name: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Update User by Name
app.put("/users/:Username", [check('Username', 'Username is required').isLength({ min: 5 }), check('Username', 'Username contains non-alphanumeric characters.').isAlphanumeric()], passport.authenticate('jwt', { session: false }), (req, res) => {

  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  Users.findOneAndUpdate(
    { Name: req.params.Username },
    {
      $set: {
        Name: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true } // This line makes sure that the updated document is returned
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Delete User by Name
app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Name: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found.");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Add a movie to favorites list
app.post("/users/:Username/movies/:MovieId", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Username },
    { $push: { FavoriteMovies: req.params.MovieId } },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Delete a movie from favorites list
app.delete("/users/:Username/movies/:MovieId", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Username },
    { $pull: { FavoriteMovies: req.params.MovieId } },
    { new: true }
  )
    .then((updatedUser) => {
      res.json(updatedUser);
      console.log(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a Movie Description by Name
app.get("/movies/:Title", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

const port = process.env.PORT || 8080;

app.listen(port, '0.0.0.0', () => {
  console.log("Your app is listening on port " + port);
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});