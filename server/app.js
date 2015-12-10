"use strict";

var express = require('express'),
    path = require('path'),
    app = express();

app.use(express.static('./server/public'));

app.all('/*', function (req, res) {
    if (req.originalUrl.indexOf('.') !== -1) {
        // Assume catchall with a suffix are missing static files
        res.sendStatus(404);
    } else if (req.headers.accept && req.headers.accept.indexOf('html') !== -1) {
        // Assume all html routes return the index.html
        res.sendFile(path.resolve(`${__dirname}/index.html`));
    } else {
        res.sendStatus(404);
    }
});

var server = app.listen(3021, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log(`Example app listening at http://${host}:${port}`);
});