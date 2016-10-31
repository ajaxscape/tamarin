'use strict'

const _ = require('lodash')
const webDriver = require('selenium-webdriver')
const By = webDriver.By
const co = require('bluebird').coroutine

const until = (world, until) => {
  /** ------------------------ extend until --------------------------- **/

  if (!world) {
    throw new Error('World must be defined')
  }

  until = until || webDriver.until
  _.extend(until, {
    foundInPage: (selector) => new until.Condition(`for $("${selector}") to be found in page`, co(function * (selector) {
      const driver = yield world.getDriver()
      return yield driver.findElement(By.css(selector))
        .then(() => true)
        .catch(() => false)
    })),
    notFoundInPage: (selector) => new until.Condition(`for $("${selector}") to not be found in page`, co(function * (selector) {
      const driver = yield world.getDriver()
      return yield driver.findElement(By.css(selector))
        .then(() => false)
        .catch(() => true)
    })),
    browserReady: () => new until.Condition('for url to not equal data ', co(function * () {
      const driver = yield world.getDriver()
      const url = yield driver.getCurrentUrl()
      return url !== 'data:,'
    })),
    cookieExists: (cookieName) => new until.Condition(`for cookie "${cookieName}" to exist`, co(function * (cookieName) {
      const driver = yield world.getDriver()
      return yield driver.manage().getCookie(cookieName)
        .then(() => true)
        .catch(() => false)
    }))
  })

  return until
}

/** --------------------- module exports ------------------------ **/

module.exports = until
