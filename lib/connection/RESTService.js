"use strict";

var jwt = require("jwt-decode");
var btoa = require('btoa');

var getRequestHeader, getLoginHeader;

const LOG_ID = 'REST - ';

class Connection {

    constructor(_credentials, _eventEmitter, _logger) {
        this.http = null;
        this.account = null;
        this.token = null;
        this.renewTokenInterval = null;
        this.auth = btoa(_credentials.login + ":" + _credentials.password);
        this.loginEmail = _credentials.login;
        this.eventEmitter = _eventEmitter;
        this.logger = _logger;

        getRequestHeader = () => { 
            return { 
                "Authorization": "Bearer " + this.token, 
                "Accept": "application/json" 
            };
        };

        getLoginHeader = () => { 
            return { 
                'Accept': 'application/json', 
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + this.auth 
            };
        }
    }

    start(http) {
        var that = this;
        this.http = http;

        this.logger.log("debug", LOG_ID + "(start) _entering_");
        return new Promise(function(resolve, reject) {
            that.logger.log("info", LOG_ID + "(start) email", that.loginEmail);
            that.logger.log("debug", LOG_ID + "(start) _exiting_");
            resolve();
        });
    }

    stop() {

    }

    get loggedInUser () {
        return this.account;
    }

    signin() {

        var that = this;

        this.logger.log("debug", LOG_ID + "(signin) _entering_");

        return new Promise(function(resolve, reject) {
            that.http.get('/api/rainbow/authentication/v1.0/login', getLoginHeader()).then(function(JSON) {
                that.account = JSON.loggedInUser;
                that.token = JSON.token
                that.logger.log("info", LOG_ID + "(signin) welcome " + that.account.displayName + '!');
                that.logger.log("debug", LOG_ID + "(signin) information", that.account);
                that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                resolve();
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, err);
                that.logger.log("debug", LOG_ID + "(signin) _exiting_");
                reject(err);
            });
        });
    }

    startTokenSurvey() {

        var that = this;

        var decodedToken = jwt(that.token);
        this.logger.log("debug", LOG_ID + "(startTokenSurvey) - token", decodedToken);
        var tokenExpirationTimestamp = decodedToken.exp * 1000;
        var expirationDate = new Date(tokenExpirationTimestamp);
        var currentDate = new Date();
        var currentTimestamp = currentDate.valueOf();
        var tokenExpirationDuration = tokenExpirationTimestamp - currentTimestamp;

        if (tokenExpirationDuration < 0) {
            this.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token has already expired, re-new it immediately");
            that._renewAuthToken();
        }
        else if (tokenExpirationDuration < 300000) {
            this.logger.log("warn", LOG_ID + "(startTokenSurvey) auth token will expire in less 5 minutes, re-new it immediately");
            that._renewAuthToken();
        }
        else {
            var usedExpirationDuration = tokenExpirationDuration - 3600000; // Refresh 1 hour before the token expiration
            this.logger.log("info", LOG_ID + "(startTokenSurvey) start token survey (expirationDate: " + expirationDate + " tokenExpirationDuration: " + tokenExpirationDuration + "ms usedExpirationDuration: " + usedExpirationDuration + "ms)");
            if (that.renewTokenInterval) { 
                clearTimeout(that.renewTokenInterval); 
            }
            that.renewTokenInterval = setTimeout(function() { 
                that._renewAuthToken();
            }, usedExpirationDuration);
        }
    }

    _renewAuthToken() {
        var that = this;

        this.logger.log("debug", LOG_ID + "(_renewAuthToken) _entering_");

        that.http.get('/api/rainbow/authentication/v1.0/renew', getRequestHeader()).then(function(JSON) {
            that.logger.log("info", LOG_ID + "(_renewAuthToken) renew authentication token success");
            that.token = JSON.token;
            that.logger.log("info", LOG_ID + "(_renewAuthToken) new token received", that.token);
            that.logger.log("debug", LOG_ID + "(_renewAuthToken) _exiting_");
            that.eventEmitter.emit("rainbow_tokenrenewed");
        }).catch(function(err) {
            that.logger.log("error", LOG_ID, "(_renewAuthToken) renew authentication token failure", err);
            clearTimeout(that.renewTokenInterval);
            that.renewTokenInterval = null;
            that.logger.log("debug", LOG_ID + "(_renewAuthToken) _exiting_");
            that.eventEmitter.emit("rainbow_tokenexpired");
        });
    }

    getContacts(listOfJid) {

        var that = this;

        return new Promise(function(resolve, reject) {

            that.logger.log("debug", LOG_ID + "(getContacts) _entering_");

            var listOfJidNumber = listOfJid.length;
            var jidList = listOfJid.reduce(function(buffer, contact) { return buffer + " " + contact.jid; }, "");

            that.http.post('/api/rainbow/enduser/v1.0/search?format=full&limit=' + listOfJidNumber, getRequestHeader(),{ "jid_im": jidList  } ).then(function(list) {
                 that.logger.log("info", LOG_ID + "(getContacts) successfull");
                 that.logger.log("info", LOG_ID + "(getContacts) REST contacts received " + list.total);
                 that.logger.log("debug", LOG_ID + "(getContacts) _exiting_");
                 resolve(list);
            }).catch(function(err) {
                that.logger.log("error", LOG_ID, "(getContacts) error", err);
                that.logger.log("debug", LOG_ID + "(getContacts) _exiting_");
                reject(err);
            });
        });
    }
};

module.exports = Connection;