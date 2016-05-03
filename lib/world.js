'use strict'

let fs = require('fs')
let path = require('path')
let webdriver = require('selenium-webdriver')
let loader = require('node-glob-loader')
let until = require('selenium-webdriver').until
let chrome = require('selenium-webdriver/chrome')
let cheerio = require('cheerio')
let _ = require('lodash')
let basePageObject = {}
let defaultTimeout = 10000
let routes = []
let screenshotPath = 'screenshots'

let co = require('bluebird').coroutine

let service = new chrome.ServiceBuilder(require('chromedriver').path).build()
chrome.setDefaultService(service)

let driver

let getDriver = () => {
  if (!driver) {
    driver = new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.chrome())
      // .withCapabilities(webdriver.Capabilities.firefox())
      .build()
  }
  return driver
}

if (!fs.existsSync(screenshotPath)) {
  fs.mkdirSync(screenshotPath)
}

let getSelector = (config, id) => _.reduce(id.split(':'), (prev, current) => {
  let selector = prev[0]
  if (_.isArray(current)) {
    selector += ' ' + current[0]
    current = current[1]
  }
  if (_.isArray(prev[1])) {
    selector += ' ' + prev[1][0]
    prev = prev[1][1]
  } else {
    prev = prev[1]
  }
  let prop = _.camelCase(current)
  let obj = prev[prop]
  if (obj) {
    if (_.isString(obj)) {
      selector += ' ' + obj
    }
    selector = selector.trim()
    if (selector) {
      return [selector.trim(), obj]
    } else {
      return prev[prop]
    }
  } else {
    throw new Error(`Cannot match "${current}" within page config for "${id}"`)
  }
}, ['', config])

/** ------------------------ extend until --------------------------- **/

_.extend(until, {
  pageMatches: (page, world) => {
    let currentPage = page
    return new until.Condition(`for page to match "${currentPage}"`, co(function * () {
      let route = yield getRoute(currentPage)
      if (!route) {
        throw new Error(`Route is not defined for "${currentPage}" page`)
      }
      let page = yield getPageObject(world)
      return page.route.path === route.path
    }))
  },
  configuredInPage: (id, world) => new until.Condition(`for "${id}" to be configured in page`, co(function * () {
    let page = yield getPageObject(world)
    return getSelector(page.config, id)[0]
  })),
  foundInPage: (selector) => new until.Condition(`for $("${selector}") to be found in page`, co(function * () {
    return yield getDriver().findElement(webdriver.By.css(selector))
      .then(() => true)
      .catch(() => false)
  })),
  notFoundInPage: (selector) => new until.Condition(`for $("${selector}") to not be found in page`, co(function * () {
    return yield getDriver().findElement(webdriver.By.css(selector))
      .then(() => false)
      .catch(() => true)
  })),
  titleIs: (expectedTitle) => new until.Condition(`for "${expectedTitle}" to match page title`, co(function * () {
    let title = yield getDriver().getTitle()
    return title === expectedTitle
  })),
  browserReady: () => new until.Condition('for url to not equal data ', co(function * () {
    let url = yield getDriver().getCurrentUrl()
    return url !== 'data:,'
  }))
})

/** --------------------- co functions ------------------------ **/

let whenVisible = co(function * (el, timeout) {
  try {
    yield getDriver().wait(until.elementIsEnabled(el), timeout || defaultTimeout)
    yield getDriver().wait(until.elementIsVisible(el), timeout || defaultTimeout)
    return Promise.resolve(el)
  } catch (e) {
    el.getOuterHtml()
      .then((html) => {
        throw new Error(e.message + '\n' + html)
      })
  }
})

let whenHidden = co(function * (el, timeout) {
  try {
    yield getDriver().wait(until.elementIsEnabled(el), timeout || defaultTimeout)
    yield getDriver().wait(until.elementIsNotVisible(el), timeout || defaultTimeout)
    return Promise.resolve(el)
  } catch (e) {
    el.getOuterHtml()
      .then((html) => {
        throw new Error(e.message + '\n' + html)
      })
  }
})

let whenMatches = co(function * (el, text, timeout) {
  try {
    yield getDriver().wait(until.elementTextIs(el, text), timeout || defaultTimeout)
    return Promise.resolve(el)
  } catch (e) {
    el.getOuterHtml()
      .then((html) => {
        throw new Error(e.message + '\n' + html)
      })
  }
})

let whenTitleIs = co(function * (title, timeout) {
  yield getDriver().wait(until.titleIs(title), timeout || defaultTimeout)
  return Promise.resolve()
})

let whenPageIs = co(function * (page, world, timeout) {
  yield getDriver().wait(until.pageMatches(page, world), timeout || defaultTimeout)
  return Promise.resolve()
})

let whenBrowserReady = co(function * (world, timeout) {
  yield getDriver().wait(until.browserReady(), timeout || defaultTimeout)
  let url = yield getDriver().getCurrentUrl()
  return Promise.resolve(url)
})

/* Find the id in the config and use the selector to find the element in the dom */
let find = co(function * (id, world, timeout) {
  let selector = 'body'
  if (id) {
    yield getDriver().wait(until.configuredInPage(id, world), timeout || defaultTimeout)
    selector = getSelector(world.currentPage.config, id)[0]
  }
  yield getDriver().wait(until.foundInPage(selector), timeout || defaultTimeout)
  return getDriver().findElement(webdriver.By.css(selector))
})

/* Find the id in the config and use the selector to not-find the element in the dom */
let notFind = co(function * (id, world, timeout) {
  yield getDriver().wait(until.configuredInPage(id, world), timeout || defaultTimeout)
  let selector = getSelector(world.currentPage.config, id)[0]
  yield getDriver().wait(until.notFoundInPage(selector), timeout || defaultTimeout)
  return Promise.resolve()
})

/** --------------------- stuff ------------------------ **/

let loadRoutes = () =>
  routes.length ? Promise.resolve(routes) : new Promise((resolve) =>
    loader.load(path.join(process.cwd(), '/**/features/routes.js'), (data, name) => {
      if (name.indexOf('node_modules') === -1) {
        _.each(data, (component, name) => routes.unshift(_.assign({component: name}, component)))
      } })
      .then(() => resolve(routes)))

let matchedRoutes = (routes, val) => routes
  .filter((route) => !route.path ? false : (_.isArray(route.path) ? route.path : [route.path])
    .some((path) => (val === path.split('/')
        .map((part, index) => part[0] === ':' ? val.split('/')[index] : part)
        .join('/')
    ) ? route : false))

let getRoute = (val, prop) => loadRoutes()
  .then((routes) => {
    prop = prop || 'component'
    val = (prop === 'component') ? _.camelCase(val) : val
    let route = _(routes).find((route) => route[prop] === val)
    if (!route && prop === 'path') {
      let matched = matchedRoutes(routes, val)
      if (matched.length > 1) {
        throw new Error('Ambigous path ' + val + ' can match any of the routes ' + _.map(matched, _.property('component')).join(' and '))
      }
      route = matched[0]
    }
    return Promise.resolve(route)
  })

let getPageObject = (world) => new Promise((resolve, reject) => whenBrowserReady(world)
  .then((url) => Promise.resolve(url.split('?')[0]))
  .then((url) => getRoute(url, 'path')
    .then((route) => {
      if (!route) {
        throw new Error(`Route is not defined for "${url}"`)
      }
      let pageConfig = _.defaultsDeep(basePageObject, route.pageObject)
      let pageObject = {
        config: pageConfig
      }
      _.each(pageConfig, (val, prop) => {
        if (_.isFunction(val)) {
          pageObject[prop] = val.bind(pageObject)
        }
      })
      if (pageObject) {
        pageObject.route = route
        world.currentPage = pageObject
        return resolve(pageObject)
      }
    }))
  .catch(reject))

/** --------------------- World class --------------------- **/

let World = (() => {
  let data = {}

  class World {
    constructor () {
      this.find = (id, timeout) => find(id, this, timeout)
      this.notFind = (id, timeout) => notFind(id, this, timeout)
      this.whenPageIs = (page, timeout) => whenPageIs(page, this, timeout)
      this.whenTitleIs = whenTitleIs
      this.executeScript = getDriver().executeScript.bind(getDriver())
    }

    hover (id, delay, timeout) {
      return find(id, this, timeout)
        .then((el) => whenVisible(el, timeout)
          .then(() => getDriver().actions().mouseMove(el).perform())
          .then(() => getDriver().sleep(delay || 0))
          .then(() => Promise.resolve(el)))
    }

    click (id, timeout) {
      return find(id, this, timeout)
        .then((el) => whenVisible(el, timeout))
        .then((el) => el.click())
    }

    sendKeys (id, text, timeout) {
      return find(id, this, timeout)
        .then((el) => whenVisible(el, timeout))
        .then((el) => el.sendKeys(text))
    }

    getHtml (id, timeout) {
      return find(id, this, timeout)
        .then((el) => el.getAttribute('outerHTML'))
    }

    load (id, timeout) {
      return this.getHtml(id, timeout)
        .then((html) => Promise.resolve(cheerio.load(html)))
    }

    select (id, query, timeout) {
      return this.load(id, timeout)
        .then(($) => Promise.resolve($(':first-child ' + (query || ''))))
    }

    getText (id, timeout) {
      return find(id, this, timeout)
        .then((el) => whenVisible(el))
        .then((el) => el.getText())
    }

    getVal (id, timeout) {
      return find(id, this, timeout)
        .then((el) => whenVisible(el))
        .then((el) => el.getAttribute('value'))
    }

    whenVisible (id, timeout) {
      return find(id, this, timeout)
        .then((el) => whenVisible(el))
        .then((el) => Promise.resolve())
    }

    whenHidden (id, timeout) {
      return find(id, this, timeout)
        .then((el) => whenHidden(el))
        .then((el) => Promise.resolve())
    }

    whenTextMatches (id, text, timeout) {
      return find(id, this, timeout)
        .then((el) => whenVisible(el, timeout))
        .then((el) => whenMatches(el, text, timeout))
        .then((el) => Promise.resolve())
    }

    setSize (width, height) {
      return Promise.resolve(getDriver().manage().window().setSize(width, height))
    }

    sleep (delay) {
      return getDriver().sleep(delay || 0)
    }

    visit (page, params) {
      return getRoute(page)
        .then((route) => {
          if (!route) {
            throw new Error(`Route is not defined for "${page}" page`)
          }
          let path = _.isArray(route.path) ? route.path[0] : route.path
          if (params) {
            let p = params ? params.split(',') : []
            let parts = route.path.split('/').map((part) => {
              if (part[0] === ':') {
                return _.kebabCase(p.shift())
              } else {
                return part
              }
            })
            path = parts.join('/')
          }
          return getDriver().get(path)
        })
    }

    getData (id) {
      return Promise.resolve(data[_.camelCase(id)])
    }

    setData (id, val) {
      return Promise.resolve(data[_.camelCase(id)] = val)
    }

    hasData (id) {
      return Promise.resolve(data.indexOf(_.camelCase(id)) !== -1)
    }

  }

  return World
})()

/** --------------------- module exports ------------------------ **/

module.exports.World = World
module.exports.getDriver = getDriver
module.exports.env = require('../lib/env')
module.exports.hooks = require('../lib/hooks')
