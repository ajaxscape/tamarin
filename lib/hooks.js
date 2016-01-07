'use strict';

var cucumber_partner = require('./world');
var driver = cucumber_partner.getDriver();
var fs = require('fs');
var path = require('path');
var sanitize = require('sanitize-filename');
var _ = require('lodash');
var routes = [];

var dir = require('node-dir');

var myHooks = function () {

    this.BeforeFeatures(function (event, done) {
        dir.readFiles(process.cwd(), {
            match: /.js$/,
            exclude: [path.join(process.cwd(), 'node_modules')]
        }, function (err, content, filename, next) {
            if (filename.indexOf('node_modules') === -1 && filename.indexOf('features') !== -1 && filename.indexOf('routes') !== -1) {
                var route = _.merge({component: filename.substr(0, filename.length - 3)}, require(filename));
                routes.push(route);
            }
            next();
        }, function (err) {
            if (err) throw err;
            cucumber_partner.setRoutes(routes);
            done();
        })
    });

    this.Before(function (scenario, next) {
        next();
    });

    this.After(function (scenario, next) {
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
