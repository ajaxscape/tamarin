'use strict';

require('chai').should();

var helpers = require('.././helpers');
var currentUser;

module.exports = function () {

    this.Given(/^I am a new user$/,
        function (next) {
            helpers.createUser(function (error, result) {
                if (error) {
                    throw new Error(error);
                } else {
                    var xxx = result;
                    next();
                }
            });
        }
    );

    this.Given(/^I have a submission$/,
        function (next) {
            helpers.createSubmission(function (error, result) {
                if (error) {
                    throw new Error(error);
                } else {
                    var xxx = result;
                    next();
                }
            });
        }
    );

};