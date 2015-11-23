'use strict';

require('chai').should();

var email = 'qa+rdm+dataset+creation@mendeley.com';
var password = '123123';

module.exports = function () {

    this.World = require('../support/world.js').World; // overwrite default World constructor

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
                        pageObject.get('username').sendKeys(email);
                        pageObject.get('password').sendKeys(password);
                        pageObject.get('submit').click().then(next);
                    }));
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
            var route = this.getRoute(page, 'path');
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