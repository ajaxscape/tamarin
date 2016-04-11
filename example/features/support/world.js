'use strict'

var tamarin = require('./../../../index')

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
}

module.exports = {
  World: World
}
