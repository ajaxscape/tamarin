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
    return Promise.resolve()
  }
}

module.exports = {
  World: World
}
