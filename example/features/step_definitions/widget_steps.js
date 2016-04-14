'use strict'

module.exports = function () {
  this.When(/^I add a widget$/, function () {
    return this.addWidget()
  })

  this.When(/^I should have 2 widgets$/, function () {
    return Promise.resolve()
  })
}
