'use strict'

var tamarin = require('./../../../index')

// var tamarin = require('tamarin')

var users = [
  {username: 'fred', password: 'abc'},
  {username: 'bill', password: 'def'},
  {username: 'sarah', password: 'ghi'}
]

class World extends tamarin.World {
  getTestUser (user) {
    return Promise.resolve(users[user])
  }
}

module.exports = {
  World: World
}
