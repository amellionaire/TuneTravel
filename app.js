/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

/**
 * DEPENDENCIES
 */
var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var MusicManager = require('./music-manager.js');

var client_id = 'c98c24a2857049e09f683e4985b58241'; // Your client id
var client_secret = '92403d2a330d4555a9206a03ade9259e'; // Your client secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get('/refresh_music', function(req, res){
    
    var results = document.createElement('div');
    var yearsago = parseInt(document.getElementById("form").value);
    if(yearsago === NaN){
        results.innerHTML = "Invalid input";
        document.getElementById("content_container").appendChild(results);
        return;
    }
    var today = new Date();
    var startdate = new Date(today.getFullYear() - yearsago, today.getMonth(), today.getDate(), 0, 0, 0, 0);
    
    var enddate = new Date(today.getFullYear() - yearsago, today.getMonth() + 3, today.getDate(), 0, 0, 0, 0);

    var tracks = MusicManager.getTracksInDateRange(startdate, enddate);
    // Array with objects of form {track: , date: } 
    /*var tracks = [
        { date: today,
          track: "spotify:track:4bz7uB4edifWKJXSDxwHcs"
        }];
*/
    var i=0;
    for(i=0; i<tracks.length; i++){
        var widget = document.createElement('iframe');
        widget.setAttribute("src", "https://embed.spotify.com/?uri=" + tracks[i].track.uri);
        widget.setAttribute("width", "300");
        widget.setAttribute("height", "380");
        widget.setAttribute("frameborder", "0");
        widget.setAttribute("allowtransparency", "true");
        
        document.getElementById("content_container").appendChild(widget);
    }
});

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code',
        client_id: client_id,
        client_secret: client_secret
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
            refresh_token = body.refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me/tracks',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // Create a music manager object by passing in access token.
        var success = MusicManager.createDatabase(access_token);
        if (success === 1) {
            console.log('created database');
        }

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }

});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

console.log('Listening on 8888');
app.listen(8888);
