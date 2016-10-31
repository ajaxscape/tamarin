'use strict'

const webDriver = require('selenium-webdriver')
const WebElement = webDriver.WebElement
const co = require('bluebird').coroutine
const _ = require('lodash')
const defaults = require('./defaults')
/** --------------------- co functions ------------------------ **/

const get = (world, defaultTimeout) => {
  if (!world) {
    throw new Error('World must be defined')
  }

  if (_.isUndefined(defaultTimeout)) {
    defaultTimeout = defaults.defaultTimeout
  } else if (!_.isNumber(defaultTimeout)) {
    throw new Error('Default Timeout must be a number')
  }

  const until = world.getUntil()

  const handleError = (e, el) => {
    if (_.isObject(el) && _.isFunction(el.getOuterHtml)) {
      return el.getOuterHtml()
        .then((html) => {
          console.error(`Error "${e.message}" while processing the following markup:\n${html}`)
          throw e
        })
    } else {
      throw e
    }
  }

  return {
    whenExists: co(function * (locator, timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.elementsLocated(locator), timeout || defaultTimeout)
        return this.findElement(locator, timeout)
      } catch (e) {
        return handleError(e, locator)
      }
    }),

    whenEnabled: co(function * (el, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
        yield driver.wait(until.elementIsEnabled(el), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return handleError(e, el)
      }
    }),

    whenDisabled: co(function * (el, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
        yield driver.wait(until.elementIsDisabled(el), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return handleError(e, el)
      }
    }),

    whenVisible: co(function * (el, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
        yield driver.wait(until.elementIsVisible(el), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return handleError(e, el)
      }
    }),

    whenHidden: co(function * (el, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
        yield driver.wait(until.elementIsNotVisible(el), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return handleError(e, el)
      }
    }),

    whenMatches: co(function * (el, text, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
        yield driver.wait(until.elementTextIs(el, text), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return handleError(e, el)
      }
    }),

    whenContains: co(function * (el, text, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        const driver = yield world.getDriver()
        yield driver.wait(until.elementTextContains(el, text), timeout || defaultTimeout)
        return Promise.resolve(el)
      } catch (e) {
        return handleError(e, el)
      }
    }),

    waitForTitle: co(function * (title, timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.titleIs(title), timeout || defaultTimeout)
        return Promise.resolve(true)
      } catch (e) {
        return handleError(e)
      }
    }),

    findElement: co(function * (el) {
      try {
        if (!(el instanceof WebElement)) {
          const driver = yield world.getDriver()
          el = yield driver.findElement(el)
        }
        return Promise.resolve(el)
      } catch (e) {
        return handleError(e, el)
      }
    }),

    waitFor: co(function * (el, timeout) {
      try {
        el = yield this.findElement(el, timeout)
        yield this.whenVisible(el, timeout)
        yield this.whenEnabled(el, timeout)
        return Promise.resolve(el)
      } catch (e) {
        return handleError(e)
      }
    }),

    waitForBrowser: co(function * (timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.browserReady(), timeout || defaultTimeout)
        return driver.getCurrentUrl()
      } catch (e) {
        return handleError(e)
      }
    }),

    waitForCookie: co(function * (cookieName, timeout) {
      try {
        const driver = yield world.getDriver()
        yield driver.wait(until.cookieExists(cookieName), timeout || defaultTimeout)
        const cookie = yield driver.manage().getCookie(cookieName)
        return cookie && cookie.hasOwnProperty('value') ? Promise.resolve(cookie) : handleError(new Error(`Cookie "${cookieName}" doesn't exist`))
      } catch (e) {
        return handleError(e)
      }
    }),

    getTimeout: () => defaultTimeout
  }
}

/** --------------------- module exports ------------------------ **/

module.exports = {
  get: get
}
