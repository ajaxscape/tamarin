'use strict'

const defaults = require('./defaults')
const cor = require('./co-routines')

/** --------------------- World class --------------------- **/

const World = (() => {
  let _data = new WeakMap()
  let _driver = new WeakMap()
  let _until = new WeakMap()

  const waitFor = (world, selector, callback, retries, timeout) => {
    const coRoutines = cor.get(world, timeout)
    const retry = (retries) => coRoutines.waitFor(selector)
      .then(callback)
      .catch((err) => {
        if (retries) {
          return world.sleep(defaults.defaultRetryDelay)
            .then(() => retry(--retries))
        }
        console.error(err.stack)
        throw err
      })
    return retry(retries)
  }
  /** Class representing a world. */
  class World {
    constructor (driver, until) {
      _data.set(this, {})
      this.getDriver(driver)
        .then((driver) => (this.executeScript = driver.executeScript.bind(driver)))
      if (until) {
        _until.set(this, require('./until')(this, until))
      }
    }

    getDriver (driver) {
      if (!_driver.get(this)) {
        _driver.set(this, driver || defaults.getDriver())
      }
      return Promise.resolve(_driver.get(this))
    }

    getUntil (until) {
      if (!_until.get(this)) {
        _until.set(this, require('./until')(this, until))
      }
      return _until.get(this)
    }

    setData (key, val) {
      let data = _data.get(this)
      return Promise.resolve(data[key] = val)
    }

    getData (key) {
      let data = _data.get(this)
      return Promise.resolve(data[key])
    }

    sleep (delay) {
      return this.getDriver()
        .then((driver) => driver.sleep(delay || 0))
    }

    visit (url) {
      return this.getDriver()
        .then((driver) => driver.get(url))
    }

    waitForTitle (title, timeout) {
      return cor.get(this).waitForTitle(title, timeout)
    }

    waitForCookie (name, timeout) {
      return cor.get(this).waitForCookie(name, timeout)
    }

    waitForUrl (timeout) {
      return cor.get(this).waitForBrowser(timeout)
    }

    waitFor (selector, retries = 5, timeout) {
      return waitFor(this, selector,
        (el) => Promise.resolve(el),
        retries, timeout)
    }

    whenExists (selector, timeout) {
      return cor.get(this).whenExists(selector, timeout)
    }

    whenEnabled (selector, timeout) {
      return cor.get(this).whenEnabled(selector, timeout)
    }

    whenDisabled (selector, timeout) {
      return cor.get(this).whenDisabled(selector, timeout)
    }

    whenVisible (selector, timeout) {
      return cor.get(this).whenVisible(selector, timeout)
    }

    whenHidden (selector, timeout) {
      return cor.get(this).whenHidden(selector, timeout)
    }

    whenMatches (selector, val, timeout) {
      return cor.get(this).whenMatches(selector, val, timeout)
    }

    whenContains (selector, val, timeout) {
      return cor.get(this).whenContains(selector, val, timeout)
    }

    sendKeys (selector, value, retries, timeout) {
      return this.waitFor(selector, retries, timeout)
        .then((el) => waitFor(this, el,
          (el) => el.sendKeys(value),
          retries, timeout))
    }

    hover (selector, delay, retries, timeout) {
      return this.waitFor(selector, retries, timeout)
        .then((el) => waitFor(this, el,
          (el) => this.getDriver()
            .then((driver) => driver.actions().mouseMove(el).perform())
            .then(() => this.sleep(delay || 0))
            .then(() => Promise.resolve(el)),
          retries, timeout))
    }

    click (selector, retries, timeout) {
      return this.waitFor(selector, retries, timeout)
        .then((el) => waitFor(this, el,
          (el) => el.click(),
          retries, timeout))
    }

    getText (selector, retries, timeout) {
      return this.waitFor(selector, retries, timeout)
        .then((el) => waitFor(this, el,
          (el) => Promise.resolve(el.getText()),
          retries, timeout))
    }

    getVal (selector, retries, timeout) {
      return this.waitFor(selector, retries, timeout)
        .then((el) => waitFor(this, el,
          (el) => Promise.resolve(el.getAttribute('value')),
          retries, timeout))
    }

    static use (extend) {
      return extend(this)
    }
  }

  return World
})()

/** --------------------- module exports ------------------------ **/

module.exports = World
