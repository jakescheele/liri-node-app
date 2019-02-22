// IMPORT FILES

// Dotenv
require("dotenv").config();

// Moment JS
var moment = require('moment');

// Spotify API
var Spotify = require('node-spotify-api');

// Spotify API Keys
var keys = require("./keys.js");

// Grab the axios package...
var axios = require("axios");

// Core node package for reading and writing files
var fs = require("fs");

// Used for Spotify API
var spotify = new Spotify(keys.spotify);

// Collects data entered in command line and assigns to variables
let args = process.argv
// removes first 2 arguments (`node filename.js`)
args.splice(0, 2);
let doWhatItSays = undefined;
// removes and captures command from what is entered on CL's first argument
let command = args.splice(0, 1)[0];

let search = args.join('+')

let searchTypes = ['concert-this', 'spotify-this-song', 'movie-this', 'do-what-it-says']
if (searchTypes.includes(command))
determineType()
else
console.log('You entered an invalid type!')

// commands (switch):
function determineType() {
    switch (doWhatItSays || command) {
        // concert-this (EX: node liri.js concert-this Subtronics)
        case "concert-this":
            if (!search) {
                console.log("You must enter an artist name!")
            }
            else {
            // BIT API event search
            axios.get("https://rest.bandsintown.com/artists/" + search + "/events?app_id=codingbootcamp")
                // Show list of arist's events (loop)
                .then(function (response) {
                    for (i in response.data) {
                        let date = moment(response.data[i].datetime);
                        // Display: Name of venue, location, Date (MM/DD/YYYY)
                        console.log(
                            '\nVenue: ', response.data[i].venue.name,
                            '\nLocation: ', response.data[i].venue.city,
                            '\nDate: ', moment(date).format("MM/DD/YYYY")
                        )
                    }
                })
                .catch(function (error) {
                    console.log("BIT Axios Error: ", error)
                })
            }
            break;

        // spotify-this-song (EX: node liri.js spotify-this-song Omega Robot)
        case "spotify-this-song":
            // default
            if (!search) {
                search = 'Never Gonna Give You Up'
            }
            // Spotify API 
            spotify
                // Dsiplay: Song name, preview link, Album
                .search({ type: 'track', query: search })
                .then(function (response) {
                    let data = response.tracks.items[0]
                    console.log(
                        "\nTrack: ", data.name,
                        "\nArtist: ", data.artists[0].name,
                        "\nAlbum: ", data.album.name,
                        "\nPreview: ", data.external_urls.spotify
                    );
                })
                .catch(function (error) {
                    console.log('Spotify Error:', error)
                })
            // Default song if none found: "Never Gonna Give You Up" by Rick Astley
            break;

        // movie-this (EX: node liri.js movie-this Die Hard)
        case "movie-this":
            // If no movie entered: "Mr. Nobody"
            if (!search) {
                search = 'Mr. Nobody'
            }
            let rtRating = '';
            let imdbRating = '';
            // OMDB API
            axios.get('http://www.omdbapi.com/?apikey=trilogy&t=' + search)
                // Display: Movie Title, Release Year, IMDB Rating, Rotten Tomatoes Rating, Country produced, Language, Plot, Actors

                .then(function (response) {
                    data = response.data
                    // console.log(data)
                    // assign ratings variables
                    // if statements correct errors that occur if ratings aren't listed
                    if (data.Ratings[0])
                        imdbRating = data.Ratings[0].Value
                    else imdbRating = "Not listed"
                    if (data.Ratings[1])
                        rtRating = data.Ratings[1].Value
                    else rtRating = "Not listed"
                    console.log(
                        "\nTitle: ", data.Title,
                        "\nRelease Year: ", data.Year,
                        "\n\nRatings: ",
                        "  \nIMDB: ", imdbRating,
                        "  \nRotten Tomatoes: ", rtRating,
                        "\n\nCountry: ", data.Country,
                        "\nLanguage: ", data.Language,
                        "\n\nPlot: ", data.Plot,
                        "\n\nActors: ", data.Actors
                    );
                    if (response.data.Error === 'Movie not found!')
                        console.log('Movie not found!')
                })
                .catch(function (error) {
                    console.log("OMDB Error: ", error)
                })
            break;

        // do-what-it-says (EX: node liri.js do-what-it-says)
        case "do-what-it-says":
            // using fs package, take text from random.txt, use it to call other command
            fs.readFile('./random.txt', 'utf8', function (error, data) {
                if (error) {
                    console.log("DWIS Error: ", error)
                }
                randomText = data.split(', ');
                doWhatItSays = randomText[0];
                search = randomText[1];
                // if statement to prevent looping
                if (doWhatItSays === 'do-what-it-says') {
                    doWhatItSays = '';
                    console.log('DWIS Error: Invalid Type Specified On Command Line')
                }
                else
                    determineType();
            });
            break;
    }
}
