'use strict'

module.exports = function () {
  this.When(/^I am logged out$/, function () {
    return this.visit('logout')
  })

  this.When(/^I login as a valid user$/, function () {
    return this.login('testuser', 'testpass')
  })
}
