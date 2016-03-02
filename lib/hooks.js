'use strict';

let cucumber_partner = require('./world');
let driver = cucumber_partner.getDriver();
let fs = require('fs');
let path = require('path');
let sanitize = require('sanitize-filename');
let _ = require('lodash');

let myHooks = function () {

    this.Before(function (scenario, next) {
        next();
    });

    this.After(function (scenario, next) {
        if (scenario.isFailed()) {
            this.driver.takeScreenshot()
                .then(function (data) {
                    let base64Data = data.replace(/^data:image\/png;base64,/, '');
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
