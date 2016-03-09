'use strict';

let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
let cucumber_partner = require('../../lib/world');

chai.use(chaiAsPromised);
chai.should();

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

  this.When(/^I click the (.*) menu link$/, function (id) {
    return this.click(`header:menu:links:${id}`);
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
    return this.select(id, 'li').should.eventually.have.length(parseInt(count));
  });

  this.Then(/^the (.*) menu link should have a (.*) of (.*)$/, function (id, attr, val) {
    return Promise.resolve(this.select(`header:menu:links:${id}`)
      .then(el => el.attr(attr)).should.eventually.equal(val));
  });
};