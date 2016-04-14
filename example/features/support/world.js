'use strict'

var tamarin = require('./../../../index')
var faker = require('faker')

// var tamarin = require('tamarin')

class World extends tamarin.World {
  login (username, password) {
    return this.sendKeys('username', username)
      .then(() => this.sendKeys('password', password))
      .then(() => this.click('login'))
  }

  logout () {
    return this.visit('logout')
  }

  initStorage () {
    return this.driver.executeScript(() => {
      (function () {
        $.localStorage.removeAll()
      })()
    })
  }

  addWidget () {
    return this.sendKeys('widgetName', faker.commerce.productName())
      .then(() => this.sendKeys('widgetDesc', faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial()))
      .then(() => this.click('addWidget'))
  }
}

module.exports = {
  World: World
}
