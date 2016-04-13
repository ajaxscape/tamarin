'use strict'

module.exports = function () {
  this.When(/^I am logged out$/, function () {
    return this.visit('logout')
      .then(() => this.whenPageIs('login'))
  })

  this.When(/^I login as a valid user$/, function () {
    return this.login('testuser', 'testpass')
  })

  this.Then(/^I login as an invalid user$/, function () {
    return this.login('baduser', 'badpass')
  })

  this.When(/^the error message is displayed/, function () {
    return this.getText('error-message').should.eventually.not.have.length(0, 'error should be displayed')
  })

  this.When(/^the error message is not displayed/, function () {
    return this.getText('error-message').should.eventually.have.length(0, 'error should not be displayed')
  })
}
