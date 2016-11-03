'use strict'

const defaults = Object.freeze({
  defaultTimeout: 10000,
  defaultRetryDelay: 250,
  getDriver: () => { throw new Error('Expected a driver to be passed in the world constructor!') }
})

/** --------------------- module exports ------------------------ **/

module.exports = defaults
