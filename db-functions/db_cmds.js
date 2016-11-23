/**
 * Created by darryl on 2016-11-22.
 */

var db = require('../db');

/** Get suggested user track.
 *
 * @param userid            The user ID from which to retrieve the suggested track.
 * @param successCallback   function(trackID, trackName, artistName, musicgroupName) to be called when command succeeds.
 * @param failureCallback   function() to be called when command fails.
 */
exports.suggestedTrack = function (userid, successCallback, failureCallback) {

    // Call failure callback on failure or no results, call successCallback with results if success.
    var cb = function(error, results) {
        if (error || results.length == 0) {
            failureCallback();
        }
        else {
            var res = results[0];
            successCallback(res.trackID, res.trackName, res.artistName, res.musicgroupName);
        }
    };

    db.query({
            sql: "SELECT track.trackID, trackName, artistName, musicgroupName " +
            "FROM musicgroupmembership AS gm " +
            "JOIN musicgroup AS g " +
            "ON gm.musicgroup = g.musicgroupID " +
            "JOIN sharedplaylists AS sp " +
            "ON g.musicgroupID = sp.musicgroup " +
            "JOIN playlist AS p " +
            "ON sp.playlist = p.playlistID " +
            "JOIN playlistordering AS po " +
            "ON p.playlistID = po.playlistID " +
            "JOIN track " +
            "ON po.trackID = track.trackID " +
            "JOIN artist " +
            "ON track.artist = artist.artistID " +
            "WHERE gm.user != ? " +
            "ORDER BY RAND() " +
            "LIMIT 1;",
            values: [userid]
        },
        cb);
};

/** Login user
 *
 * @param username          The username of the logging in user.
 * @param password          The password of the logging in user.
 * @param successCallback   function(userID) to be called when command succeeds.
 * @param failureCallback   function() to be called when command fails.
 */
exports.loginUser = function(username, password, successCallback, failureCallback){

    // Call successCallback with userID if success, call failureCallback if false
    var cbmiddle = function(error, results){
        if (error) {
            failureCallback();
        }
        else {
            var userid = results[0].userID;
            successCallback(userid);
        }
    };

    // Query for user
    // TODO: Password hashing?
    db.query({
            sql: "SELECT userID " +
            "FROM user " +
            "WHERE username = ? " +
            "AND password = ?",
            values: [username, password]
        },
        cbmiddle);
};

/** Create user.
 *
 * @param username          The requested new username.
 * @param password          The requested new password.
 * @param prefFirstName     The requested first name.
 * @param lastName          The requested last name.
 * @param successCallback   function(trackID, trackName, artistName, musicgroupName) to be called when command succeeds.
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.createUser = function(username, password, prefFirstName, lastName, successCallback, failureCallback){
    // Call loginUser to retrieve User ID on create user success, call failureCallback with a message otherwise
    var cbmiddle1 = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else {
            // Apply msg, since loginuser cb doesn't take an arg
            var failure = function() {failureCallback("Undefined error.")};
            exports.loginUser(username, password, successCallback, failure);
        }
    };

    // Insert user
    // TODO: Password hashing?
    db.query({
            sql: "INSERT INTO user(username, password, prefFirstName, lastName) " +
            "VALUES(?, ?, ?, ?)",
            values: [username, password, prefFirstName, lastName]
        },
        cbmiddle1);
};

/** Get user first name.
 *
 * @param userid            The userid to retrieve first and last name for.
 * @param successCallback   function(firstName, lastName, username) to be called when command succeeds.
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.getUserFullNameAndUsername = function(userid, successCallback, failureCallback) {
    // Call loginUser to retrieve User ID on create user success, call failureCallback with a message otherwise
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else if (results.length == 0) {
            failureCallback("User not found.");
        }
        else {
            // Apply msg, since loginuser cb doesn't take an arg
            var failure = function() {failureCallback("Undefined error.")};
            successCallback(results[0].prefFirstName, results[0].lastName, results[0].username);
        }
    };

    // Get user's full name
    db.query({
            sql: "SELECT prefFirstName, lastName, username FROM user WHERE userid = ?",
            values: [userid]
        },
        cb);
};

/** Update user with new password.
 *
 * @param userid            The userID to update.
 * @param password          The new password.
 * @param successCallback   function() to be called when command succeeds.
 * @param failureCallback   function(error) to be called when command fails. Contains error text.
 */
exports.updateUserPassword = function(userid, password, successCallback, failureCallback) {
    // Call successCallback on update success, call failureCallback with a message otherwise
    var cb = function(error, results){
        if (error) {
            failureCallback(error);
        }
        else {
            successCallback();
        }
    };

    // Update user with new password
    // TODO: Password hashing?
    db.query({
            sql: "UPDATE user(password) " +
            "VALUES(?) WHERE userid = ?",
            values: [userid, password]
        },
        cb);
};