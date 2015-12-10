'use strict';

require('chai').should();
var cucumber_partner = require('./lib/world');
var helpers = require('../support/helpers');

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
            this.currentPage.expectPageToEventuallyBe(page, next);
        }
    );

};
