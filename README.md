# MovieAPI for myFlix

API for My FLIX movie database
This code sets up a basic API for managing movies.

## Routes

### USERS

- POST /users: Creates a new user.
- LOGIN
- PUT /users/:userId: Updates the name of a specific user.
- PATCH /users/:userId/favorites/:movieTitle: Adds a movie to the favorite movies list of a specific user.
- DELETE /users/:userId/favorites/:movieTitle: Removes a movie from the favorite movies list of a specific user.
- DELETE /users/:userId: Deletes a specific user.

### MOVIES

- GET /movies: Retrieves a list of all movies.
- GET /users: Retrieves a list of all users.
- GET /movies/:title: Retrieves data about a specific movie based on its title.
- GET /movies/genre/:genreName: Retrieves data about a specific genre based on its name.
- GET /movies/director/:directorName: Retrieves data about a specific director based on their name.
