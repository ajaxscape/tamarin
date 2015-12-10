'use strict';

var fs = require('fs');
var path = require('path');
var routes = [];

fs.readdirSync(__dirname).forEach(function (filename) {
    if (filename !== 'index.js') {
        var route = require(path.join(__dirname, filename));
        route.component = filename.substr(0, filename.length - 3);
        routes.push(route);
    }
});

module.exports = routes;