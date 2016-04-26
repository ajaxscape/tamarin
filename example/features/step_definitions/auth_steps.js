'use strict'

module.exports = function () {
  this.When(/^I create a valid user$/, function () {
    return this.createUser()
      .then((user) => this.setStorage('validUser', user))
  })

  this.When(/^I am logged out$/, function () {
    return this.visit('logout')
      .then(() => this.whenPageIs('login'))
  })

  this.When(/^I reset all data$/, function () {
    return this.initStorage()
  })

  this.When(/^I login as a valid user$/, function () {
    return this.whenPageIs('login')
      .then(() => this.getStorage('validUser'))
      .then((user) => this.login(user.username, user.password))
  })

  this.When(/^I login as an invalid user$/, function () {
    return this.createUser()
      .then((user) => this.login(user.username, user.password))
  })

  this.When(/^I login and visit the (.*) page$/, function (page) {
    return this.visit(page)
      .then(() => this.whenPageIs('login'))
      .then(() => this.getStorage('validUser'))
      .then((user) => this.login(user.username, user.password))
  })
}
