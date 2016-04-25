'use strict'

module.exports = function () {
  this.When(/^I add (?:a|another) widget$/, function () {
    return this.addWidget()
  })

  this.When(/^I should have (\d+) (?:widget|widgets)$/, function (count) {
    return this.select('widgets', 'li').should.eventually.have.length(parseInt(count))
  })

  this.When(/^I remove the (.*) widget$/, function (pos) {
    return this.removeWidget(pos)
  })
}
