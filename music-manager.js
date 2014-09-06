/**
 * music-manager.js
 * Contains functions to load and query the authorized user's Spotify library.
 */

/**
 * DEPENDENCIES
 */
var request = require('request');

// array of every playlist track object
var user_id = null;
var library = [];

// WORKFLOW for building database
    // GET request for playlists

    // am going to have to keep track of which playlist we are on

    // for each playlist
    // TODO (bbarg) use query string to limit to just track field (if necessary)
    // GET request for all tracks (need to do this in 100 track chunks)
       // return track

/**
 * Class: Dated_Track 
 * Caches the parsed UTC date string so that searching through the
 * whole list later is faster.
 */
function DatedTrack(playlist_track) {
    this.date = Date.parse(playlist_track.added_at);
    this.track = playlist_track;
}

/**
 * Reads a user's spotify library into a hash-table organized by playlist
 * add date.
 */
function createDatabase(access_token) {

    while (api_helper.hasMorePlaylistTracks()) {
	// get user_id
	var options = {
            url: 'https://api.spotify.com/v1/me',
            headers: { 'Authorization': 'Bearer ' + access_token },
            json: true
        };

	request.get(options, function(error, response, body) {
            user_id = body.id;
        });

	var library_hunk;

	for (var i = 0; i < library_hunk.length; i++) {
	    library.push(new DatedTrack(library_hunk[i]));
	}
    }

    library.sort( function(dtrack_1, dtrack_2) {
	var date1 = Number(track1.date);
	var date2 = Number(track2.date);

	if (date1 == date2)
	    return 0;
	else if (date1 > date2) 
	    return 1;
	else
	    return -1;
    });
}

/**
 * Returns an array of DatedTrack's within the specified date
 * range. Parameters are js Date objects.
 */
function selectTracksInRange(start_date, end_date) {
    var tracks_in_range = [];
    var i = 0;

    while (Number(library[i].date) < Number(start_date)) {
	i++;
    }

    while (Number(library[i].date) < Number(end_date) && i < array.length) {
	tracks_in_range.push(library[i]);
	i++;
    }

    return tracks_in_range;
}
