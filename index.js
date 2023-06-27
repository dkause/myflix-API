const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const app = express();
app.use(bodyParser.json());

let Movies = [
  { 
    movieId: "1",
    title: "Bladerunner",
    description:
      "Im Science-Fiction-Klassiker Blade Runner macht Harrison Ford im Jahr 2019 Jagd auf Replikanten. Die menschenähnlichen Androiden suchen auf der Erde nach ihrem Schöpfer",
    director: {
      name: "Ridley Scott",
      bio: "Still lives and makes movies, which are getting worse. British and started his carreer in advertisement ",
      birth: "1937",
    },
    genre: {
      name: "Science Fiction",
      description:
        "Realistic speculation about possible future events, based solidly on adequate knowledge of the real world, past and present, and on a thorough understanding of the nature and significance of the scientific method.",
    },
  },
  {
    movieId: "2",
    title: "Stalker",
    description:
      "Ein Führer bringt zwei Männer in eine Gegend, die nur als die Zone bekannt ist, und in der sie schließlich einen Raum vorfinden, der Wünsche erfüllt.",
    director: {
      name: "Andrei Tarkowski",
      bio: "Andrei Tarkovsky wurde am 4 April 1932 in Zavrazhe, Yurevetskiy rayon, Ivanovskaya Promyshlennaya oblast, RSFSR, USSR [ora Ivanovskaya oblast, Russia] geboren. Er war Autor und Regisseur, bekannt für Opfer (1986), Solaris (1972) und Nostalghia (1983). Er war mit Larisa Tarkovskaya und Irina Tarkovskaya verheiratet. Er starb am 29 Dezember 1986 in Frankreich.",
      birth: "1932",
    },

    genre: {
      name: "Arthouse",
      description:
        "Unter Arthouse versteht man Filme, die meist fernab der großen Studios gedreht und produziert werden. In der Regel definieren sich diese Streifen durch wesentlich weniger kommerziellen, sondern vielmehr durch künstlerischen Anspruch.",
    },
  },
];

let users = [
  {
    userId: "1",
    name: "Kim",
    favoriteMovies: [],
  },
  {
    userId: "2",
    name: "Joe",
    favoriteMovies: ["Bread2000"],
  },
];

// Get a list of all movies
app.get("/movies", (req, res) => {
  res.status(200).json(Movies);
});

// Get a list of all users
app.get("/users", (req, res) => {
  res.status(200).json(users);
});

// Get data about a movie via title
app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = Movies.find((movie) => movie.title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie :-(");
  }
});

// Get data about a genre via genreName
app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = Movies.find((movie) => movie.genre.name === genreName).genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre :-(");
  }
});

// Get data about a genre via genreName
app.get("/movies/director/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = Movies.find(
    (movie) => movie.director.name === directorName
  ).director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director :-(");
  }
});

// CREATE new User
app.post("/users/", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.userId = uuid.v4();
    users.push(newUser);
    res.status(201).json(users);
  } else {
    res.status(400).send("users need a name !");
  }
});

// UPDATE User Name
app.put("/users/:userId", (req, res) => {
  const { userId } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.userId == userId);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("Username not found");
  }
});

// CREATE favorite Movie
app.patch("/users/:userId/favorites/:movieTitle", (req, res) => {
  const { userId, movieTitle } = req.params;

  let user = users.find((user) => user.userId == userId);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${userId} his array`);
  } else {
    res.status(400).send("Username not found");
  }
});

// DELETE favorite movie out of list
app.delete("/users/:userId/favorites/:movieTitle", (req, res) => {
  const { userId, movieTitle } = req.params;

  let user = users.find((user) => user.userId == userId);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res
      .status(200)
      .send(`${movieTitle} has been deleted from user ${userId} his array`);
  } else {
    res.status(400).send("Username not found");
  }
});

// DELETE User
app.delete("/users/:userId/", (req, res) => {
  const { userId } = req.params;

  let user = users.find((user) => user.userId == userId);

  if (user) {
    users = users.filter((user) => user.userId != userId);
    res.status(200).send("user ${id} is deleted");
  } else {
    res.status(400).send("Username not found");
  }
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
