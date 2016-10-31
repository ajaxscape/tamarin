'use strict'

const webDriver = require('selenium-webdriver')

const defaults = Object.freeze({
  defaultTimeout: 10000,
  defaultRetryDelay: 250,
  getDriver: () => (() => {
    const phantomjs = webDriver.Capabilities.phantomjs()
    phantomjs.set('phantomjs.binary.path', require('phantomjs-prebuilt').path)
    return (new webDriver.Builder()
      .withCapabilities(phantomjs)
      .build())
  })()
})

/** --------------------- module exports ------------------------ **/

module.exports = defaults
