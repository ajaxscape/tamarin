'use strict';

var cucumber_partner = require('./lib/world');

cucumber_partner.setConfig({host: 'http://localhost:3021'});
cucumber_partner.setRoutes(require('../routes'));

module.exports = {};