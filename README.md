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

## MongoDB Collections
*users*
```
{"_id":{"$oid":"654f79b2097700dc74631ad0"},
"Username":"Daniel",
"Password":"$2b$10$Ei/SocQMEtlUQxP0IeVkmugXk7qqywnmXibuy6VPjB6kGZL.qbcnu",
"Email":"d.g.kause@gmail.com",
"Birthday":{"$date":{"$numberLong":"43977600000"}},
"FavoriteMovies":[{"$oid":"64a6db98478d0280daa6be48"}],
"__v":{"$numberInt":"0"}}
```
*movies*
```
{"_id":{"$oid":"64a6c874478d0280daa6be45"},
"Title":"Silence of the Lambs",
"Description":"To catch a serial killer, a yound FBI cadet seeks the help of an incarcerated and manipulative cannibal killer.",
"Genre":
{"Name":"Thriller",
"Description":"Thriller film, also known as suspense film or suspense thriller, is a broad film genre that involves excitement and suspense in the audience"},
"Director":{"Name":"Jonathan Demme",
"Bio":" Robert Jonathan Demme was an American director, producer, and screenwriter.","Birth":"1944","Death":"2017"},"ImagePath":"https://placehold.co/600x400","Featured":true}
```
