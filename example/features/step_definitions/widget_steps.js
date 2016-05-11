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

  this.Given(/^I login and visit the first widget$/, function () {
    return this.getStorage('widgets')
      .then((widgets) => this.visit('widget', widgets[0].id))
      .then(() => this.getStorage('validUser'))
      .then((user) => this.login(user.username, user.password))
  })
}
