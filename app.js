const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieNametoPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//List of Movies API 1
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `
    SELECT movie_name FROM movie;
    `;
  const moviesArray = await db.all(getAllMoviesQuery);
  response.send(
    moviesArray.map((moviename) => convertMovieNametoPascalCase(moviename))
  );
});

//add movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
   INSERT INTO
   movie (director_id, movie_name, lead_actor)
   VALUES (
       ${directorId},
       '${movieName}'
       '${leadActor}'
   );
   `;
  const dbResponse = await db.run(addMovieQuery);
  //console.log(dbResponse);
  response.send("Movie Successfully Added");
});

//conversion db object to response object
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

//Get movie with movie ID API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
     SELECT * FROM movie WHERE movie_id = ${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  console.log(movieId);
  response.send(convertDbObjectToResponseObject(movie));
});

//Update movie details API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE 
    movie
    SET 
     director_id = ${directorId},
     movie_name = '${movieName}',
     lead_actor = '${leadActor}'
    WHERE 
    movie_id = ${movieId};
    `;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDireectorDetailsToPascalCase = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//6 List of Directors API
app.get("/directors/", async (request, response) => {
  const getAllDirectorQuery = `
    SELECT * FROM director;
    `;
  const moviesArray = await db.all(getAllDirectorQuery);
  response.send(
    moviesArray.map((director) => convertDireectorDetailsToPascalCase(director))
  );
});
const convertMovieNameToPascalCase = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

//list of all movies of specified director API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieQuery = `
     SELECT movie_name FROM director
     INNER JOIN movie ON  director_id = movie.director_id
     WHERE 
     director.director_id = ${directorId};
    `;
  const movies = await db.all(getDirectorMovieQuery);
  response.send(
    movies.map((movienames) => convertMovieNameToPascalCase(movienames))
  );
});
module.exports = app;
