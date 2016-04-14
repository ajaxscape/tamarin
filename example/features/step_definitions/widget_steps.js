'use strict'

module.exports = function () {
  this.When(/^I add a widget$/, function () {
    return this.addWidget()
  })
}
