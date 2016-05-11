'use strict'

module.exports = function () {
  this.When(/^I am using a desktop$/, function () {
    this.setData('device type', 'desktop')
    return this.setSize(1024, 768)
  })

  this.When(/^I visit the (.*) page$/, function (page) {
    return this.visit(page)
  })

  this.Then(/^I should eventually be on the (.*) page$/, function (page) {
    return this.whenPageIs(page)
  })

  this.When(/^I click the (.*) menu link$/, function (id) {
    id = `header:menu:links:${id}`
    return this.click(id, 300)
  })

  this.When(/^I type "(.*)" into the (.*)$/, function (text, id) {
    return this.sendKeys(id, text)
  })

  this.Then(/^the value of the (.*) should be "(.*)"$/, function (id, expectedVal) {
    return this.getVal(id).should.eventually.equal(expectedVal)
  })

  this.Then(/^the (.*) text should contain "(.*)"$/, function (id, expectedText) {
    return this.getText(id).should.eventually.contain(expectedText)
  })

  this.Then(/^the (.*) should eventually be "([^"]*)"$/, function (id, text) {
    return this.whenTextMatches(id, text)
  })

  this.Then(/^the (.*) should not exist$/, function (id) {
    return this.notFind(id)
  })

  this.Then(/^I expect to see a list of (\d+) (.*)$/, function (count, id) {
    return this.select(id, 'li').should.eventually.have.length(parseInt(count))
  })

  this.Then(/^the (.*) menu link should have a (.*) of (.*)$/, function (id, attr, val) {
    return Promise.resolve(this.select(`header:menu:links:${id}`)
      .then((el) => el.attr(attr)).should.eventually.equal(val))
  })

  this.Then(/^I should be using a (.*)$/, function (device) {
    return this.getData('device type').should.eventually.equal(device)
  })

  this.When(/^the (.*) is displayed$/, function (id) {
    return this.whenVisible(id)
  })

  this.When(/^the (.*) is not displayed$/, function (id) {
    return this.whenHidden(id)
  })
}
