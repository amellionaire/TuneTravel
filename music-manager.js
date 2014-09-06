/**
  * Music Manager Object
  */

exports.createDatabase = function(user_token) {
    if (user_token) {
        console.log(user_token);
        return 1;
    }
    else {
        return 0;
    }
}

