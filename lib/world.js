'use strict';

let fs = require('fs'),
  path = require('path'),
  webdriver = require('selenium-webdriver'),
  loader = require('node-glob-loader'),
  until = require('selenium-webdriver').until,
  chrome = require('selenium-webdriver/chrome'),
  cheerio = require('cheerio'),
  _ = require('lodash'),
  basePageObject = {},
  defaultTimeout = 10000,
  config,
  routes = [],
  world,
  screenshotPath = 'screenshots';

let co = require('bluebird').coroutine;

let service = new chrome.ServiceBuilder(require('chromedriver').path).build();
chrome.setDefaultService(service);

let driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).//withCapabilities(webdriver.Capabilities.firefox()).
build();

if (!fs.existsSync(screenshotPath)) {
  fs.mkdirSync(screenshotPath);
}

/***************************** extend until ******************************/

_.extend(until, {
  pageMatches: (page) => {
    let currentPage = page;
    return new until.Condition(`for page to match "${currentPage}"`, co(function* () {
      let route = yield getRoute(currentPage);
      if (!route) {
        throw new Error(`Route is not defined for "${currentPage}" page`);
      }
      let page = yield getPageObject(world);
      return page.route.path === route.path;
    }));
  },
  configuredInPage: (id) => new until.Condition(`for "${id}" to be configured in page`, co(function* () {
    let page = yield getPageObject(world);
    return page.config.hasOwnProperty(_.camelCase(id));
  })),
  foundInPage: (selector) => new until.Condition(`for $("${selector}") to be found in page`, co(function* () {
    let isValid = false;
    yield driver.findElement(webdriver.By.css(selector))
      .then(() => isValid = true)
      .thenCatch((err) => isValid = false);
    return isValid;
  })),
  notFoundInPage: (selector) => new until.Condition(`for $("${selector}") to not be found in page`, co(function* () {
    let isValid = false;
    yield driver.findElement(webdriver.By.css(selector))
      .then(() => isValid = false)
      .thenCatch((err) => isValid = true);
    return isValid;
  })),
  titleIs: (expectedTitle) => new until.Condition(`for "${expectedTitle}" to match page title`, co(function* () {
    let title = yield driver.getTitle();
    return title === expectedTitle;
  })),
  browserReady: () => new until.Condition('for url to not equal data; ', co(function* () {
    let url = yield driver.getCurrentUrl();
    return url !== 'data:,';
  }))
});

/************************ co functions ***************************/


let whenVisible = co(function* (el, timeout) {
  yield driver.wait(until.elementIsEnabled(el), timeout || defaultTimeout);
  yield driver.wait(until.elementIsVisible(el), timeout || defaultTimeout);
  return Promise.resolve(el);
});

let whenMatches = co(function* (el, text, timeout) {
  yield driver.wait(until.elementTextIs(el, text), timeout || defaultTimeout);
  return Promise.resolve(el);
});

let whenTitleIs = co(function* (title, timeout) {
  yield driver.wait(until.titleIs(title), timeout || defaultTimeout);
  return Promise.resolve();
});

let whenPageIs = co(function* (page, timeout) {
  yield driver.wait(until.pageMatches(page), timeout || defaultTimeout);
  return Promise.resolve();
});

let whenRoutesLoaded = co(function* (timeout) {
  yield driver.wait(until.pageMatches(page), timeout || defaultTimeout);
  return Promise.resolve();
});

let whenBrowserReady = co(function* (world, timeout) {
  yield driver.wait(until.browserReady(), timeout || defaultTimeout);
  let url = yield world.driver.getCurrentUrl();
  return Promise.resolve(url);
});

/* Find the id in the config and use the selector to find the element in the dom */
let find = co(function* (id, timeout) {
  let selector = 'body';
  if (id) {
    yield driver.wait(until.configuredInPage(id), timeout || defaultTimeout);
    selector = world.currentPage.config[_.camelCase(id)];
  }
  yield driver.wait(until.foundInPage(selector), timeout || defaultTimeout);
  return driver.findElement(webdriver.By.css(selector))
});

/* Find the id in the config and use the selector to not-find the element in the dom */
let notFind = co(function* (id, timeout) {
  yield driver.wait(until.configuredInPage(id), timeout || defaultTimeout);
  let selector = world.currentPage.config[_.camelCase(id)];
  yield driver.wait(until.notFoundInPage(selector), timeout || defaultTimeout);
  return Promise.resolve();
});

/************************** stuff *****************************/

let loadRoutes = () => routes.length ? Promise.resolve(routes) : new Promise((resolve) => loader.load(path.join(process.cwd(), '/**/features/routes/*.js'), (route, name) => {
    if (name.indexOf('node_modules') === -1) {
      routes.push(_.merge({component: name.substr(0, name.length - 3).replace(/^.*(\\|\/|\:)/, '')}, route));
    }
  })
  .then(() => resolve(routes)));

let matchedRoute = (routes, val) => routes
  .filter((route) => !route.path ? matched : (_.isArray(route.path) ? route.path : [route.path])
    .some((path) => (val === path.split('/')
        .map((part, index) => part[0] === ':' ? val.split('/')[index] : part)
        .join('/')
    ) ? route : false))[0];

let getRoute = (val, prop) => new Promise((resolve, reject) => loadRoutes()
  .then((routes) => {
    prop = prop || 'component';
    val = (prop === 'component') ? _.camelCase(val) : val;
    let route = _(routes).find((route) => route[prop] === val);
    if (route) {
      resolve(route);
    } else if (prop === 'path') {
      resolve(matchedRoute(routes, val));
    } else {
      resolve();
    }
  })
  .catch(reject));

let getPageObject = (world) => new Promise((resolve, reject) => whenBrowserReady(world)
  .then((url) => getRoute(url.substr(config.host.length), 'path')
    .then((route) => {
      if (!route) {
        throw new Error(`Route is not defined for "${url}"`);
      }
      let pageConfig = _.defaultsDeep(basePageObject, route.pageObject);
      let pageObject = {
        world: world,
        config: pageConfig
      };
      _.each(pageConfig, (val, prop) => {
        if (_.isFunction(val)) {
          pageObject[prop] = val.bind(pageObject);
        }
      });
      if (pageObject) {
        pageObject.route = route;
        world.currentPage = pageObject;
        return resolve(pageObject);
      }
    }))
  .catch(reject));

/************************ World class **************************/

let World = (() => {
  let privateProps = new WeakMap();

  class World {
    constructor () {
      world = this;
      this.webdriver = webdriver;
      this.driver = driver;
      this.find = find;
      this.notFind = notFind;
      this.whenPageIs = whenPageIs;
      this.whenTitleIs = whenTitleIs;
    }

    click (id) {
      return find(id)
        .then(el => whenVisible(el))
        .then(el => el.click());
    }

    sendKeys (id, text) {
      return find(id)
        .then(el => whenVisible(el))
        .then(el => el.sendKeys(text));
    }

    getHtml (id) {
      return find(id)
        .then(el => el.getAttribute('outerHTML'));
    }

    select (id, query) {
      return this.getHtml(id)
        .then(html => {
          let $ = cheerio.load(html);
          return Promise.resolve($(':first-child ' + (query || '')));
        });
    }

    getText (id) {
      return find(id)
        .then(el => whenVisible(el))
        .then(el => el.getText());
    }

    getVal (id) {
      return find(id)
        .then(el => whenVisible(el))
        .then(el => el.getAttribute('value'));
    }

    whenVisible (id) {
      return find(id)
        .then(el => whenVisible(el))
        .then(el => Promise.resolve());
    }

    whenTextMatches (id, text) {
      return find(id)
        .then(el => whenVisible(el))
        .then(el => whenMatches(el, text))
        .then(el => Promise.resolve());
    }

    setSize (width, height) {
      return Promise.resolve(driver.manage().window().setSize(width, height));
    }

    visit (page, params) {
      return new Promise((resolve) => getRoute(page)
        .then((route) => {
          if (!route) {
            throw new Error(`Route is not defined for "${page}" page`);
          }
          let path = config.host + (_.isArray(route.path) ? route.path[0] : route.path);
          if (params) {
            let p = params ? params.split(',') : [];
            let parts = route.path.split('/').map((part) => {
              if (part[0] === ':') {
                return _.kebabCase(p.shift());
              } else {
                return part;
              }
            });
            path = config.host + parts.join('/');
          }
          driver.get(path);
          resolve();
        }))
    };

  }

  return World;
})();

/************************ module exports ***************************/

module.exports.World = World;
module.exports.getDriver = () => driver;
module.exports.getCurrentWorld = () => world;
module.exports.setConfig = (myConfig) => config = myConfig;
module.exports.setPageConfig = (pageConfig) => basePageObject = _.defaultsDeep(basePageObject, pageConfig);
module.exports.env = require('../lib/env');
module.exports.hooks = require('../lib/hooks');
