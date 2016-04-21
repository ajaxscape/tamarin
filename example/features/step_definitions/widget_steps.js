'use strict'

module.exports = function () {
  this.When(/^I add a widget$/, function () {
    return this.addWidget()
  })

  this.When(/^I should have (\d+) (?:widget|widgets)$/, function (count) {
    return Promise.resolve()
  })
}
