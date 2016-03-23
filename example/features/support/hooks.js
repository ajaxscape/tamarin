'use strict'

var tamarin = require('./../../../index')

// var tamarin = require('tamarin')

module.exports = function () {
  this.World = require('./../support/world').World // overwrite default World constructor
  this.setDefaultTimeout(3600000)
  tamarin.hooks.apply(this, arguments)
}
