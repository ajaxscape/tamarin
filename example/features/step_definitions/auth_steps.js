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

  this.Then(/^I login as an invalid user$/, function () {
    return this.login('baduser', 'badpass')
  })
}
