'use strict';

var driver = require('./world.js').getDriver();
var fs = require('fs');
var path = require('path');
var sanitize = require('sanitize-filename');

var myHooks = function () {

    var intervalId;

    this.Before(function (next) {
        var getCurrentPage = () => this.getPageObject().then((pageObject) => this.currentPage = pageObject);
        getCurrentPage();
        intervalId = setInterval(getCurrentPage,250);
        next();
    });

    this.After(function (scenario, next) {
        clearInterval(intervalId);
        if (scenario.isFailed()) {
            this.driver.takeScreenshot()
                .then(function (data) {
                    var base64Data = data.replace(/^data:image\/png;base64,/, '');
                    fs.writeFile(path.join('screenshots', sanitize(scenario.getName() + '.png').replace(/ /g, '_')), base64Data, 'base64', function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
        }
        this.driver.manage().deleteAllCookies()
            .then(function () {
                next();
            });
    });

    this.AfterFeatures(function (event, next) {
        driver.quit();
        next();
    });

};

module.exports = myHooks;
