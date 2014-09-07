/**
 * music-manager.js
 * Contains functions to load and query the authorized user's Spotify library.
 */

/**
 * DEPENDENCIES
 */
var request = require('request');

var library = [];

/**
 * Class: Dated_Track 
 * Caches the parsed UTC date string so that searching through the
 * whole list later is faster.
 */
function DatedTrack(playlist_track) {
    this.date = Date.parse(playlist_track.added_at);
    this.track = playlist_track.track;
}

/**
 * Reads a user's spotify library into a hash-table organized by playlist
 * add date.
 * TODO (bargbb) error checking for all HTTP requests
 */
exports.createDatabase = function(access_token) {

    var user_id = null;
    var error_return = 0;

    // get user_id
    // TODO (bargbb) strip out unneccessary field from request
    var options = {
        url: 'https://api.spotify.com/v1/me',
        headers: { 'Authorization': 'Bearer ' + access_token },
        json: true
    };

    request.get(options, function(error, response, body) {
	error_return = error;
        user_id = body.id;
    });

    if (error_return != 200)
	return error_return;

    // grab all the playlists
    var MAX_PLAYLISTS = 50; // max allowed by Spotify API
    var playlists_offset = 0;
    var num_playlists_returned = MAX_PLAYLISTS;
    var playlists = [];

    // TODO (bbarg) should we process all the playlists first, or do
    // the tracks ASAP so that library can be accessed while it's being populated
    while (num_playlists_returned === MAX_PLAYLISTS) {
	var options = {
	    url: 'https://api.spotify.com/v1/' + user_id + '/playlists',
	    headers: { 'Authorization': 'Bearer ' + access_token },
	    json: true,
	    limit: 50, 
	    offset: playlists_offset
	}

	request.get(options, function(error, response, body) {
	    error_return = error;
	    num_playlists_returned = body.items.length;
	    
	    for (var i = 0; i < num_playlists_returned; i++) {
		playlists.push(body.items[i]);
	    }

	    playlist_offset += num_playlists_returned;
	});

	if (error_return != 200)
	    return error_return;
    }

    // grab all the tracks and add them to the library
    var MAX_TRACKS = 100;
    var num_tracks_returned = MAX_TRACKS;
    var tracks_offset = 0;

    for (var i = 0; i < playlists.length; i++) {
	
	var playlist_id = playlist[i].id;

	while (num_tracks_returned === MAX_TRACKS) {
	    var options = {
		url: 'https://api.spotify.com/v1/' + user_id + '/playlists/' + playlist_id + '/tracks',
		headers: { 'Authorization': 'Bearer ' + access_token },
		json: true,
		limit: 50, 
		offset: tracks_offset
	    }

	    request.get(options, function(error, response, body) {
		error_return = error;
		num_tracks_returned = body.items.length;

		for (var i = 0; i < num_tracks_returned; i++) {
		    library.push(new DatedTrack(body.items[i]));
		}

		tracks_offset += num_tracks_returned;
	    });

	    if (error_return != 200)
		return error_return;
	}
    }
    
    // sort the library of playlist tracks by date
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

    return error_return;
}

/**
 * Returns an array of DatedTrack's within the specified date
 * range. Parameters are js Date objects.
 */
exports.getTracksInDateRange = function(start_date, end_date) {
    var tracks_in_range = [];
    var i = 0;

    while (Number(library[i].date) < Number(start_date)) {
	i++;
    }

    while (Number(library[i].date) < Number(end_date) && i < library.length) {
	tracks_in_range.push(library[i]);
	i++;
    }

    return tracks_in_range;
}
