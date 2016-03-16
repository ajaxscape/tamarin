'use strict'

/*eslint no-multi-spaces: 0*/

let base_url = 'http://localhost:3021'

module.exports = () => {
  this[`${base_url}/`]            = require('./components/home')
  this[`${base_url}/home`]        = require('./components/home')
  this[`${base_url}/bad`]         = require('./components/bad')
  this[`${base_url}/real-bad`]    = require('./components/bad')
  this[`${base_url}/widgets`]     = require('./components/widgets')
  this[`${base_url}/widgets/:id`] = require('./components/widget')
}
