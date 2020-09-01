//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {
        const movies = await APIService.fetchMovies()
        HomePage.renderMovies(movies);
        APIService.fetchGenres();
    }
}

class APIService {//all fetching
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    static async fetchMovies() {
        const url = APIService._constructUrl(`movie/now_playing`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static async fetchMovie(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}`)
        const response = await fetch(url)
        const data = await response.json()
        return new Movie(data)
    }
    static _constructUrl(path) {
        //?api_key=bf7ab359462818f32eb7b959cdf93a06
        return `${this.TMDB_BASE_URL}/${path}?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}`;
    }
    static async fetchGenres(){
        const dropdownMenu = document.querySelector(".dropdown-menu")
        const url = APIService._constructUrl(`genre/movie/list`)
        const response = await fetch(url);
        const data = await response.json()

        ///discover/movie?with_genres=18
        const genres = data.genres.map(genre => genre.name)
        console.log(genres)
        genres.forEach(genre => {
            //`<a class="dropdown-item" href="#">${genre}</a>`
            let dropdownEl = document.createElement("a")
            dropdownEl.className = "dropdown-item";
            dropdownEl.innerText = genre;
            dropdownMenu.appendChild(dropdownEl)
        })
    }

    static async fetchAllActors(){
        const url = APIService._constructUrl(`person/popular`)
        const response = await fetch(url);
        const data = await response.json()
        console.log(data.results)
        return data
    }
}

class HomePage {
    static container = document.getElementById('container');
    static renderMovies(movies) {
        movies.forEach(movie => {
            const movieDiv = document.createElement("div");
            const movieImage = document.createElement("img");
            movieImage.src = `${movie.backdropUrl}`;
            const movieTitle = document.createElement("h3");
            movieTitle.textContent = `${movie.title}`;
            movieImage.addEventListener("click", function() {
                Movies.run(movie);
            });

            movieDiv.appendChild(movieTitle);
            movieDiv.appendChild(movieImage);
            this.container.appendChild(movieDiv);
        })
    }
}


class Movies {
    static async run(movie) {
        const movieData = await APIService.fetchMovie(movie.id)
        MoviePage.renderMovieSection(movieData);
        APIService.fetchActors(movieData)
    }
}

class MoviePage {
    static container = document.getElementById('container');
    static renderMovieSection(movie) {
        MovieSection.renderMovie(movie);
    }
}

class MovieSection {
    static renderMovie(movie) {
        MoviePage.container.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img id="movie-backdrop" src=${movie.backdropUrl}> 
        </div>
        <div class="col-md-8">
          <h2 id="movie-title">${movie.title}</h2>
          <p id="genres">${movie.genres}</p>
          <p id="movie-release-date">${movie.releaseDate}</p>
          <p id="movie-runtime">${movie.runtime}</p>
          <h3>Overview:</h3>
          <p id="movie-overview">${movie.overview}</p>
        </div>
      </div>
      <h3>Actors:</h3>
    `;
    }
}

class Movie {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';
    constructor(json) {
        this.id = json.id;
        this.title = json.title;
        this.releaseDate = json.release_date;
        this.runtime = json.runtime + " minutes";
        this.overview = json.overview;
        this.backdropPath = json.backdrop_path;
    }

    get backdropUrl() {
        return this.backdropPath ? Movie.BACKDROP_BASE_URL + this.backdropPath : "";
    }
}

class Actors {
    static async run() {
        const actorsData = await APIService.fetchAllActors()
        ActorsPage.renderActors(actorsData);
        // APIService.fetchActors(movieData)
    }
}

class Actor {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780'
    constructor(json){
        this.id = json.id;
        this.name = json.name;
        this.gender = json.gender;
        this.knownFor = json.known_for;
        this.popularity = json.popularity;
        this.profilePath = json.profile_path;
    }

    get backdropUrl() {
        return this.profilePath ? Actor.BACKDROP_BASE_URL + this.profilePath : "";
    }
}

class ActorsPage {
    static container = document.getElementById('container');
    
    static renderActors(actors) {
        //clear container
        this.container.innerHTML = "";
        console.log( actors)
        actors.results.forEach(actor => {
            // const actorInstance = new Actor(actor)
            const actorDiv = document.createElement("div");
            const actorImage = document.createElement("img");
            actorImage.src = `${actor.profilePath}`;
            const actorName = document.createElement("h3");
            actorName.textContent = `${actor.name}`;
            actorImage.addEventListener("click", function() {
                //go to actor page
            });

            actorDiv.appendChild(actorName);
            actorDiv.appendChild(actorImage);
            this.container.appendChild(actorDiv);
        })
    }
}

const actorsBtn = document.querySelector("#actors")
document.addEventListener("DOMContentLoaded", App.run);
actorsBtn.addEventListener("click", Actors.run)
// select the drop menu
// when page loaded we fetch data from url +/genre/movie/list
//