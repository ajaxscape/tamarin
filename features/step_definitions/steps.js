'use strict';

require('chai').should();

module.exports = StepDefinitionsWrapper;

function StepDefinitionsWrapper() {

    this.World = require('../support/world.js').World; // overwrite default World constructor

    this.When(/^I am signed out$/,
        function (next) {
            this.visit('signOut')
                .then(() => this.getPageObject()
                    .then((pageObject) => pageObject.expectToBeLoggedOut(next))
                );
        }
    );

    this.When(/^I am signed in as (.*) with password (.*)/,
        function (username, password, next) {
            this.visit('signIn')
                .then(() => this.getPageObject()
                    .then((pageObject) => {
                        pageObject.get('username').sendKeys(username);
                        pageObject.get('password').sendKeys(password);
                        pageObject.get('submit').click().then(() => pageObject.expectToBeLoggedIn(next));
                    }));
        }
    );

    this.When(/^I visit the (.*) page$/,
        function (page, next) {
            this.visit(page)
                .then(next);
        }
    );

    this.When(/^I visit the (.*) page for (.*)$/,
        function (page, link, next) {
            this.visit(page, link)
                .then(next);
        }
    );

    this.Then(/^I expect the page title to be (.*)$/,
        function (title, next) {
            this.getPageObject()
                .then((pageObject) => pageObject.expectPageTitle(title, next));
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

    this.When(/^I click on the (.*) menu link$/,
        function (page, next) {
            this.getPageObject()
                .then((pageObject) => pageObject.clickPageLink(page)
                    .then(() => setTimeout(next, 600))); // timeout to allow any animation
        }
    );

    this.Then(/^I expect the (.*) menu link to exist$/,
        function (page, next) {
            this.getPageObject()
                .then((pageObject) => pageObject.expectPageToContainPageLink(page, next));
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

    this.When(/^I click the (.*)$/,
        function (link, next) {
            this.getPageObject()
                .then((pageObject) => pageObject.get(link).click()
                    .then(() => setTimeout(next, 450))); // timeout to allow any animation
        });

    this.Then(/^I expect to be logged in$/,
        function (next) {
            this.getPageObject()
                .then((pageObject) => pageObject.expectToBeLoggedIn(next));
        }
    );

    this.Then(/^I expect to be logged out$/,
        function (next) {
            this.getPageObject()
                .then((pageObject) => pageObject.expectToBeLoggedOut(next));
        }
    );

    this.When(/^I add the gallery (.*)$/,
        function (gallery, next) {
            this.visit('galleries')
                .then(() => this.getPageObject()
                    .then((pageObject) => {
                        pageObject.get('title').sendKeys(gallery);
                        pageObject.get('description').sendKeys('anything');
                        pageObject.get('submit').click().then(
                            () => next(),
                            () => next());
                    })
                );
        }
    );

}