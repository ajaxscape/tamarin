'use strict';

require('chai').should();

var co = require('bluebird').coroutine;
var cucumber_partner = require('../../lib/world');

cucumber_partner.setConfig({host: 'http://localhost:3021'});
cucumber_partner.setRoutes(require('../routes'));

module.exports = function () {

    this.World = cucumber_partner.World; // overwrite default World constructor

    this.setDefaultTimeout(60 * 1000);

    this.When(/^I am using a desktop$/,
        function (next) {
            this.setSize(1024, 768);
            next();
        }
    );

    this.When(/^I visit the (.*) page$/,
        function (page, next) {
            this.visit(page)
                .then(next);
        }
    );

    this.Then(/^I should eventually be on the (.*) page$/,
        function (page, next) {
            this.waitForPage(page, 10000)
                .then(next)
        }
    );

    this.When(/^I click the (.*)$/,
        function (id, next) {
            this.find(id).then(this.click);
        }
    );

    this.Then(/^The (.*) text should contain "([^"]*)"$/,
        function (id, text, next) {
            var el = this.find(id);
            el.text().should.contain(text);
            next();
        }
    );

};