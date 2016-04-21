'use strict'

module.exports = function () {
  this.When(/^I am logged out$/, function () {
    return this.visit('logout')
      .then(() => this.whenPageIs('login'))
  })

  this.When(/^I reset all data$/, function () {
    return this.initStorage()
  })

  this.When(/^I login as a valid user$/, function () {
    return this.login('testuser', 'testpass')
  })

  this.When(/^I login as an invalid user$/, function () {
    return this.login('baduser', 'badpass')
  })

  this.When(/^I login and visit the (.*) page$/, function (page) {
    return this.visit(page)
      .then(() => this.login('testuser', 'testpass'))
  })
}
