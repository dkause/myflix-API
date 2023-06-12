const express = require("express");
morgan = require("morgan");
 fs = require('fs');
 path = require('path');

const app = express();

// random JSON data for testing  
let topMovies = [
  {
    title: "fast and furios 1",
    author: "Ford",
  },
  {
    title: "fast and furios 2",
    author: "Ferrari",
  },
  {
    title: "fast and furios 3",
    author: "Coca Cola",
  },
];

// create a write stream (in append mode)
// a ‘log.txt’ file is created in root directory
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));

// GET requests
app.get("/", (req, res) => {
  res.send("Welcome to my movie api!");
});

// Route to all files in folder 'puclic'
app.use(express.static('public'));

app.get("/movies", (req, res) => {
  res.json(topMovies);
});

// listen for requests
app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  // res.status(500).send('Something broke!');
});
