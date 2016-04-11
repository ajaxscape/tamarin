'use strict'

module.exports = function () {
  this.Then(/^I should be on the (.*) page$/, function (page) {
    return this.whenPageIs(page)
  })
}
