'use strict';

require('chai').should();
var helpers = require('.././helpers');

module.exports = function () {

    this.World = require('.././world.js').World; // overwrite default World constructor

    this.When(/^I am signed out$/,
        function (next) {
            this.visit('signOut')
                .then(next);
        }
    );

    this.When(/^I am signed in$/,
        function (next) {
            this.visit('signOut') // will redirect to sign-in
                .then(() => this.getPageObject()
                    .then((pageObject) => {
                        var user = helpers.getCurrentUser();
                        pageObject.get('username').sendKeys(user.email);
                        pageObject.get('password').sendKeys(user.password);
                        pageObject.get('submit').click().then(next);
                    })
                    .catch(() => {
                        throw new Error('Route is not defined');
                    })
                );
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
            var route = this.getRoute(page);
            if (!route) {
                throw new Error('Route is not defined for "' + page + '" page');
            }
            this.getPageObject()
                .then((pageObject) => {
                    pageObject.route.should.equal(route);
                    next();
                });
        }
    );

    this.Then(/^I expect the page to not contain the (.*)$/,
        function (id, next) {
            this.getPageObject()
                .then((pageObject) => pageObject.expectPageToNotContain(id, next));
        }
    );

    this.Then(/^I expect the page to contain the (.*)$/,
        function (id, next) {
            this.getPageObject()
                .then((pageObject) => pageObject.expectPageToContain(id, next));
        }
    );

    this.When(/^I am using a mobile/,
        function (next) {
            this.setSize(480, 320);
            next();
        }
    );

    this.When(/^I am using a desktop$/,
        function (next) {
            this.setSize(1024, 768);
            next();
        }
    );

    this.When(/^I click (.*)$/,
        function (link, next) {
            this.getPageObject()
                .then((pageObject) => pageObject.get(link).click()
                    .then(() => setTimeout(next, 450))); // timeout to allow any animation
        });

};