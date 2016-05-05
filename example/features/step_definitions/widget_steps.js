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

  this.Given(/^I login and visit the last widget$/, function () {
    return this.getStorage('widgets')
      .then((widgets) => {
        let widget = widgets[widgets.length - 1]
        return this.visit('widget', [widget.id])
      })
      .then(() => this.whenPageIs('login'))
      .then(() => this.getStorage('validUser'))
      .then((user) => this.login(user.username, user.password))
  })
}
