//the API documentation site https://developers.themoviedb.org/3/

// Renders the start of the App
class App {
    static async run() {
        const movies = await APIService.fetchMovies()
        const home = document.querySelector("#home")
        const logo = document.querySelector(".navbar-brand")
        HomePage.renderMovies(movies);
        APIService.fetchGenres();
        home.addEventListener("click", () => {
            const container = document.querySelector("#container")
            container.innerHTML = "";
            HomePage.renderMovies(movies)
        })
        logo.addEventListener("click", () => {
            const container = document.querySelector("#container")
            container.innerHTML = "";
            HomePage.renderMovies(movies)
        })
    }
}

//Fetch all the data
class APIService {
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
    static async fetchMoviesOfGenre(genreId){
        const urlStart= APIService._constructUrl(`discover/movie`);
        const url = urlStart + `&with_genres=${genreId}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    static async fetchGenres(){
        const dropdownMenu = document.querySelector(".dropdown-menu");
        const url = APIService._constructUrl(`genre/movie/list`);
        const response = await fetch(url);
        const data = await response.json();
        
        
        const genres = data.genres.map(genre => genre.name)
        const ids = data.genres.map(genre=>genre.id)
        data.genres.forEach(genre => { 
            //we append an event listener of each genre of dropdown menu
            let dropdownEl = document.createElement("a")
            dropdownEl.className = "dropdown-item";
            dropdownEl.innerText = genre.name;
            dropdownEl.style.cursor = "pointer";
            dropdownMenu.appendChild(dropdownEl);
            dropdownEl.addEventListener("click", async () =>{
            const genreMovies = await APIService.fetchMoviesOfGenre(genre.id)
            const arrMovieObj = genreMovies.results.map(movie=>new Movie(movie))
            GenrePage.renderMovies(arrMovieObj)
            })
        })
    }

    

    static async fetchAllActors(){
        const url = APIService._constructUrl(`person/popular`)
        const response = await fetch(url);
        const data = await response.json()
        return data.results.map(actor => new Actor(actor))
    }
    
    static async fetchActor(actorId){
        const url = APIService._constructUrl(`person/${actorId}`)
        const response = await fetch(url)
        const data = await response.json()
        return new Actor(data)
    }

    static async fetchSearch(input){
        try {
        const restOfurl = `&language=en-US&query=${input}&page=1&include_adult=false`
        const url = APIService._constructUrl(`search/multi`) + restOfurl
        const response = await fetch(url);
        const data = await response.json()
        return data
        }
        catch(err){
            console.log(err)
        }
    }

    static async fetchMovieCredits(movieId){
        const url = APIService._constructUrl(`movie/${movieId}/credits`)
        const response = await fetch(url)
        const data = await response.json()
        return data;
    }

        //fetch directors and actors 
    static async fetchDirectors(id) {
        const resp= await APIService.fetchMovieCredits(id);
        const directors = await resp.crew.filter(crew=>crew.job==="Director")
        // data.crew[??].job: "Director"
        return directors
    }

    static async fetchCast(id){
        const resp = await APIService.fetchMovieCredits(id);
        const cast  = resp.cast.slice(0,5);
        return cast
    }

    
    static async fetchTrailer(movieId){
        const url = APIService._constructUrl(`movie/${movieId}/videos`)
        const response = await fetch(url)
        const data = await response.json()
        return data;
    }

    static async fetchSimilarMovies(movieId){
        const url = APIService._constructUrl(`movie/${movieId}/similar`)
        const response = await fetch(url)
        const data = await response.json()
        return data;
    }

}

class HomePage {
    static container = document.getElementById('container');

    static renderMovies(movies) {
        this.container.innerHTML= "";
        movies.forEach(movie => {
            //create bootstrap col class for each div wiht title + img
            this.container.classList.add("d-flex");
            this.container.classList.add("flex-wrap");
            const movieDiv = document.createElement("div");
            const movieImage = document.createElement("img");
            movieImage.classList.add("img-fluid");
            movieDiv.classList.add("col-lg-4");
            movieDiv.classList.add("movieDiv");
            movieDiv.classList.add("col-md-6");
            movieDiv.classList.add("p-4");
            movieImage.style.cursor = "pointer";
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

class SearchPage{
    static container = document.getElementById('container');
    static renderSearch(data){
        if(data===undefined) {
            //if there is no value in input = alert to insert 
            alert("Type a movie or an actor's name")
        }
        else{
        this.container.innerHTML = "";
        data.forEach(element => {
            //render movie or actor from search-fetch 
            //add event which call single movie page or single actor page
            this.container.classList.add("d-flex");
            this.container.classList.add("flex-wrap");
            const elementDiv = document.createElement("div");
            const titleElement = document.createElement("h1");
            const elementImage = document.createElement("img");
            elementImage.classList.add("img-fluid");
            elementDiv.classList.add("col-lg-4");
            elementDiv.classList.add("col-md-6");
            elementDiv.classList.add("p-4");
            elementImage.style.cursor = "pointer";
            
            if (element.media_type === "person"){
                const elemInstance = new Actor(element)
                if(elemInstance.backdropUrl){
                    elementImage.src = `${elemInstance.backdropUrl}`;
                }else{
                    elementImage.src= "./img/NoThumbnail.png";
                }
                
                titleElement.innerText = `${elemInstance.name}`;
                elementImage.addEventListener("click", function() {
                    SingleActorPage.renderActor(elemInstance);
                });
                elementDiv.appendChild(titleElement);
                elementDiv.appendChild(elementImage);
                this.container.appendChild(elementDiv);
            }
            else if(element.media_type ==="movie"){
                const elemInstance = new Movie(element)
                if(elemInstance.backdropUrl){
                    elementImage.src = `${elemInstance.backdropUrl}`
                }else{
                    elementImage.src= "./img/NoThumbnail.png";
                }
                titleElement.innerText = `${elemInstance.title}`;
                
                
                elementImage.addEventListener("click", function() {
                    Movies.run(elemInstance);
                })
                
                elementDiv.appendChild(titleElement);
                elementDiv.appendChild(elementImage);
                this.container.appendChild(elementDiv);
            }
        })}
    }
}

// Uses run method to fetch single movies
class Movies {
    static async run(movie) {
        const movieData = await APIService.fetchMovie(movie.id)
        MoviePage.renderMovieSection(movieData);
    }
}

// Renders all the movies that have been fetched
class MoviePage {
    static container = document.getElementById('container');
    static renderMovieSection(movie) {
        MovieSection.renderMovie(movie);
    }
}


// Renders the single movie page
// genresNames fetches the names of genres of the movie
class MovieSection {
    static genresNames(movie){
        return movie.genres.map(el => el.name).join(", ")
    }
    static async renderMovie(movie) {
        const trailerUrl = await APIService.fetchTrailer(movie.id)
        const directors = await APIService.fetchDirectors(movie.id);
        const castMembers=  await APIService.fetchCast(movie.id);
        let similarMovies= await APIService.fetchSimilarMovies(movie.id);
        similarMovies= similarMovies.results.slice(0,5)
        MoviePage.container.innerHTML = `
      <div class="row">
        <div class="col-md-4">
        <img id="movie-backdrop" src=${movie.backdropUrl?movie.backdropUrl:"./img/NoThumbnail.png"}> 
        </div>
        <div class="col-md-8">
        <h2 id="movie-title">${movie.title}</h2>
          <div class= "d-flex flex-wrap">
            <div class="left">
                <p id="genres">${this.genresNames(movie)}</p>
                <div class="d-flex">
                    <p>Language:</p>
                    <p>&nbsp;</p>
                    <p id="languages">${movie.language}</p>
                </div>
                <div class="d-flex">
                    <p>Release Date:</p>
                    <p>&nbsp;</p>
                    <p id="movie-release-date">${movie.releaseDate}</p>
                </div>
                <div class="d-flex">
                    <p>Runtime:</p>
                    <p>&nbsp;</p>
                    <p id="movie-runtime">${movie.runtime}</p>
                </div>
                <div class="d-flex" >
                    <p>Vote Count: </p>
                    <p>&nbsp;</p>
                    <p>${movie.voteCount}  </p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;</p>
                    <p>Vote Average: </p>
                    <p>&nbsp;</p>
                    <p>${movie.voteAverage}
                </div>
            </div>
            <div class="right d-flex flex-wrap">
                <p> <strong>Director(s):</strong> </p>
                <p>&nbsp;</p>
                ${directors.map(director => `<span>${(director.name)}</span>`)}
             </div>
            </div>
          </div>
          <div class="d-flex flex-wrap">
            <div class="col-md-8">
            <h3>Overview:</h3>
            <p id="movie-overview">${movie.overview}</p>
            <Production Companies:</p>
            <div>${
                movie.production.map(company=>{
                    const logoSrc = movie.backdropUrlProduction(company.logo_path)?movie.backdropUrlProduction(company.logo_path): "./img/logo1.svg"
                    return `
                    <div class="d-flex">
                    <p>${company.name}</p>
                    <p>&nbsp;</p>
                    <img src=${logoSrc} class="logoCompany" alt="logoCompany"/>
                    </div>`
                }).join(" ")}
            </div>
          </div>
            <div class="col-lg-4">
                <iframe width="100%" height="215" src="https://www.youtube.com/embed/${trailerUrl.results[0]? trailerUrl.results[0].key: ""}"
                frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
            </div>
        </div>
      </div>
      <div class="d-flex flex-column">
        <h3>Actors:</h3>
        <div class="cast">
                    ${
                        castMembers.map(actor => `<p class="cast-member" style="cursor:pointer"> ${actor.name}</p>`).join(" ")
                    }
        </div>
      </div>
      <div >
      ${similarMovies.length > 0? (
        `<h3>Similar Movies:</h3>
        <div class="similarMovies d-flex flex-wrap ">
        ${similarMovies.map(similarMovie =>{
            return `<div class="similar-movie  col-md-3 col-lg-2 d-flex flex-wrap justify-content-center">
                            <h6>${similarMovie.title}</h6>
                            <img style= "cursor:pointer" src="${movie.backdropUrlProduction(similarMovie.backdrop_path)}" class="img-fluid " />
                        </div>`
        }).join(" ")}
        </div>`
      ): ""}
    </div>`;
    //similar movies section
    const similarMoviesSelect = document.querySelectorAll(".similar-movie");
    for(let i=0; i<similarMoviesSelect .length; i++){
        similarMoviesSelect[i].addEventListener("click", async ()=>{
            const similarMovie = await APIService.fetchMovie(similarMovies[i].id)
            MovieSection.renderMovie(similarMovie)
        })
    }

    }
}

// each fetched movie is created using the Movie class
// constructor adds the information needed

class Movie {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';
    constructor(json) {
        this.id = json.id;
        this.genres = json.genres;//arr of obj
        this.title = json.title;
        this.releaseDate = json.release_date;
        this.runtime = json.runtime + " minutes";
        this.overview = json.overview;
        this.backdropPath = json.backdrop_path? json.backdrop_path : json.poster_path;
        this.language = json.original_language;
        this.production = json.production_companies;//arr of obj
        this.voteCount = json.vote_count;
        this.voteAverage = json.vote_average
    }
    //to get the logo
    backdropUrlProduction(path) {
        return path ? Movie.BACKDROP_BASE_URL + path : "";
    }

    //construct link to get the movie poster
    get backdropUrl() {
        return this.backdropPath ? Movie.BACKDROP_BASE_URL + this.backdropPath : "";
    }
}

// The run method uses the fetched actors and renders them in the actors page
class Actors {
    static async run() {
        const actorsData = await APIService.fetchAllActors()
        ActorsPage.renderActors(actorsData);
    }
}

// each fetched actor is created using the Actor class
// constructor adds the information needed
class Actor {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780'
    constructor(json){
        this.id = json.id;
        this.name = json.name;
        this.gender = json.gender===2? "male" : "famale"; 
        this.knownFor = json.known_for;
        this.popularity = json.popularity;
        this.profilePath = json.profile_path;
        this.birthday = json.birthday;
        this.deathday= json.deathday;
        this.bio = json.biography;
    }
    // construct link to the actor's picture
    get backdropUrl() {
        return this.profilePath ? Actor.BACKDROP_BASE_URL + this.profilePath : "";
    }
}


// uses renderActors method to remove all existing html in the container
// and renders the fetched actors
class ActorsPage {
    static container = document.getElementById('container');
    
    static renderActors(actors) {
        this.container.innerHTML = "";
        actors.forEach(actor => {
            this.container.classList.add("d-flex");
            this.container.classList.add("flex-wrap");
            const actorDiv = document.createElement("div");
            const actorImage = document.createElement("img");
            actorImage.classList.add("img-fluid");
            actorDiv.classList.add("col-lg-4");
            actorDiv.classList.add("col-md-6");
            actorDiv.classList.add("p-4");

            actorImage.style.cursor = "pointer";
            actorImage.src = `${actor.backdropUrl}`;
            const actorName = document.createElement("h3");
            actorName.textContent = `${actor.name}`;
            
            actorImage.addEventListener("click", async function() {
                SingleActorPage.renderActor(actor)
            });

            actorDiv.appendChild(actorName);
            actorDiv.appendChild(actorImage);
            this.container.appendChild(actorDiv);
        })
    }
}

// Renders the single actor page 
class SingleActorPage{
    
    static async renderActor(actor) {
        const singleActor = await APIService.fetchActor(actor.id)
        const birthday = singleActor.birthday===null? "unknown" : singleActor.birthday
        const deathday = singleActor.deathday === null? "alive" :singleActor.deathday
        const container = document.querySelector("#container")
        container.innerHTML = ""
       container.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img id="movie-backdrop" src=${actor.backdropUrl?actor.backdropUrl:"./img/NoThumbnail.png"} > 
        </div>
        <div class="col-md-8">
          <h2 id="actor-name">${actor.name}</h2>
          <h3>gender:</h3>
          <p id="gender">${actor.gender}</p>
          <h3>birthday/deathday:</h3>
          <p id="birthday">${birthday}/ ${deathday}</p>
          <h3>popularity</h3>
          <p id="popularity">${actor.popularity}</p>
          <h3>Biography</h3>
          <p id="bio"> ${singleActor.bio}</p>
          <h4>Famous for:</h4>
            <div className="knownfor">
                
           ${ //related movies section for actors
            actor.knownFor.map(movie=>{
                if (movie.media_type==="tv"){ 
                    
                   return `<p class= "related-show" style="cursor:pointer">${movie.original_name}</p>`
                    
                }
                else {
                 return `<p class= "related-show" style="cursor:pointer">${movie.original_title}</p>`
               
                }
                

            }).join("")
            
        }
            </div>
          
        </div>
      </div>
    `;
    
        const famousForMovies = document.querySelectorAll(".related-show")
            for(let i= 0; i<famousForMovies.length; i++){
                famousForMovies[i].addEventListener("click", async (e)=> {
                    e.preventDefault()
                        if (actor.knownFor[i].original_name) {
                        const container = document.querySelector("#container");
                        container.innerHTML = "";
                        const div = document.createElement("div");
                        div.classList.add("fullPage");
                        div.innerHTML = `<h1>This is a tv show and it is not present in movie database</h1>`;
                        return container.appendChild(div);
                    }
                   let movie = await APIService.fetchMovie(actor.knownFor[i].id)
                   MovieSection.renderMovie(movie)
                
                })
            }
           
        
    }
}

function showAbout(){
    const container = document.getElementById('container');
    container.innerHTML = "";
    container.innerHTML = `
      <div class="fullPage">
        <h1>
            About:
        </h1>
        <p>
        This website was designed by <a href="https://github.com/fadime94" target="_blank">Fadime OZDEMIR</a> and <a href="https://github.com/majdajroudi" target="_blank">Majd AJROUDI </a>as a project for the <a href="https://www.re-coded.com/web-overview" target="_blank">Re:coded Frontend Development Bootcamp</a>.<br/>
        Object oriented programming techniques were applied to add the functionalities provided in the website using Javascript.<br/>
        The database is provided by themoviedb.org was used to fetch the data of the movies and present it as shown in the website.
        
        </p>
      </div>  
    `;
}

// renderMovies takes the fetched movies of a specific genre as an input 
// and renders all fetched movies in the page
class GenrePage {
    static container = document.getElementById('container');

    static renderMovies(movies) {
        this.container.innerHTML= "";
        movies.forEach(movie => {
            this.container.classList.add("d-flex");
            this.container.classList.add("flex-wrap");
            const movieDiv = document.createElement("div");
            const movieImage = document.createElement("img");
            movieImage.classList.add("img-fluid");
            movieDiv.classList.add("col-lg-4");
            movieDiv.classList.add("col-md-6");
            movieDiv.classList.add("p-4");
            movieImage.style.cursor = "pointer";
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


//event listeners for the navbar links
//search button
const searchBtn = document.querySelector("[type='submit']");
searchBtn.addEventListener("click", async function(e){
    e.preventDefault();
    const input = document.querySelector("#search-input")
    srchResults = await APIService.fetchSearch(input.value)
    SearchPage.renderSearch(srchResults.results)
    })

// event listener to the actors button in the navbar
const actorsBtn = document.querySelector("#actors");
actorsBtn.addEventListener("click", Actors.run)

// event listener to the about button in the navbar
const about = document.querySelector("#about")
about.addEventListener("click", showAbout)

document.addEventListener("DOMContentLoaded", App.run);




// select the drop menu
// when page loaded we fetch data from url +/genre/movie/list
