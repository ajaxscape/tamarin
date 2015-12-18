'use strict';

var expect = require('chai').expect;
var cucumber_partner = require('../../lib/world');

cucumber_partner.setConfig({host: 'http://localhost:3021'});
cucumber_partner.setRoutes(require('../routes'));

module.exports = function () {

    this.World = cucumber_partner.World; // overwrite default World constructor

    this.setDefaultTimeout(6000);

    this.When(/^I am using a desktop$/,
        function (next) {
            this.setSize(1024, 768);
            next()
        }
    );

    this.When(/^I visit the (.*) page$/,
        function (page, next) {
            this.visit(page)
                .then(next)
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
            this.click(id)
                .then(next)
        }
    );

    this.When(/^I type "(.*)" into the (.*)$/,
        function (text, id, next) {
            this.sendKeys(id, text)
                .then(next)
        }
    );

    this.Then(/^the value of the (.*) should be "(.*)"$/,
        function (id, expectedVal, next) {
            this.getVal(id)
                .then(val => {
                    expect(val).to.equal(expectedVal);
                    next()
                })
                .catch(next)
        }
    );

    this.Then(/^the (.*) text should contain "(.*)"$/,
        function (id, expectedText, next) {
            this.getText(id)
                .then(text => {
                    expect(text).to.contain(expectedText);
                    next()
                })
                .catch(next)
        }
    );

};