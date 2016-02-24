'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var cucumber_partner = require('../../lib/world');

chai.use(chaiAsPromised);
chai.should();

cucumber_partner.setConfig({host: 'http://localhost:3021'});

module.exports = function () {

  this.World = cucumber_partner.World; // overwrite default World constructor

  this.setDefaultTimeout(60000);

  this.When(/^I am using a desktop$/, function () {
    return this.setSize(1024, 768);
  });

  this.When(/^I visit the (.*) page$/, function (page) {
    return this.visit(page);
  });

  this.Then(/^I should eventually be on the (.*) page$/, function (page) {
    return this.whenPageIs(page);
  });

  this.When(/^I click the (.*)$/, function (id) {
    return this.click(id);
  });

  this.When(/^I type "(.*)" into the (.*)$/, function (text, id) {
    return this.sendKeys(id, text);
  });

  this.Then(/^the value of the (.*) should be "(.*)"$/, function (id, expectedVal) {
    return this.getVal(id).should.eventually.equal(expectedVal);
  });

  this.Then(/^the (.*) text should contain "(.*)"$/, function (id, expectedText) {
    return this.getText(id).should.eventually.contain(expectedText);
  });

  this.Then(/^the (.*) should eventually be "([^"]*)"$/, function (id, text) {
    return this.whenTextMatches(id, text);
  });

  this.Then(/^the (.*) should not exist$/, function (id) {
    return this.notFind(id);
  });

  this.Then(/^I expect to see a list of (\d+) (.*)$/, function (count, id) {
    return this.select(id, 'li').should.eventually.have.length(parseInt(count))
  });
};