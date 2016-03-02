'use strict';

let fs = require('fs'),
  path = require('path'),
  webdriver = require('selenium-webdriver'),
  loader = require('node-glob-loader'),
  chrome = require('selenium-webdriver/chrome'),
  cheerio = require('cheerio'),
  _ = require('lodash'),
  basePageObject = {},
  defaultTimeout = 10000,
  config,
  routes,
  world,
  screenshotPath = 'screenshots';

let co = require('bluebird').coroutine;

let service = new chrome.ServiceBuilder(require('chromedriver').path).build();
chrome.setDefaultService(service);

let driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).
//withCapabilities(webdriver.Capabilities.firefox()).
build();

if (!fs.existsSync(screenshotPath)) {
  fs.mkdirSync(screenshotPath);
}

/************************ World class **************************/

let World = (function () {
  let privateProps = new WeakMap();

  class World {
    constructor() {
      world = this;

      /***************************** extend until ******************************/

      let until = require('selenium-webdriver').until;

      _.extend(until, {
        pageMatches: (page) => {
          let currentPage = page;
          return new until.Condition(`for page to match "${currentPage}"`, co(function* () {
            let route = yield world.getRoute(currentPage);
            if (!route) {
              throw new Error(`Route is not defined for "${currentPage}" page`);
            }
            let page = yield world.__getPageObject();
            return page.route.path.toString() === route.path.toString();
          }));
        },
        configuredInPage: (id) => new until.Condition(`for "${id}" to be configured in page`, co(function* () {
          let page = yield world.__getPageObject();
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

      this.__whenVisible = co(function* (el, timeout) {
        yield driver.wait(until.elementIsEnabled(el), timeout || defaultTimeout);
        yield driver.wait(until.elementIsVisible(el), timeout || defaultTimeout);
        return Promise.resolve(el);
      });

      this.__whenMatches = co(function* (el, text, timeout) {
        yield driver.wait(until.elementTextIs(el, text), timeout || defaultTimeout);
        return Promise.resolve(el);
      });

      this.__whenRoutesLoaded = co(function* (timeout) {
        yield driver.wait(until.pageMatches(page), timeout || defaultTimeout);
        return Promise.resolve();
      });

      this.__whenBrowserReady = co(function* (timeout) {
        yield driver.wait(until.browserReady(), timeout || defaultTimeout);
        let url = yield this.driver.getCurrentUrl();
        return Promise.resolve(url);
      });

      this.whenTitleIs = co(function* (title, timeout) {
        yield driver.wait(until.titleIs(title), timeout || defaultTimeout);
        return Promise.resolve();
      });

      this.whenPageIs = co(function* (page, timeout) {
        yield driver.wait(until.pageMatches(page), timeout || defaultTimeout);
        return Promise.resolve();
      });

      /* Find the id in the config and use the selector to find the element in the dom */
      this.find = co(function* (id, timeout) {
        let selector = 'body';
        if (id) {
          yield driver.wait(until.configuredInPage(id), timeout || defaultTimeout);
          selector = world.currentPage.config[_.camelCase(id)];
        }
        yield driver.wait(until.foundInPage(selector), timeout || defaultTimeout);
        return driver.findElement(webdriver.By.css(selector))
      });

      /* Find the id in the config and use the selector to not-find the element in the dom */
      this.notFind = co(function* (id, timeout) {
        yield driver.wait(until.configuredInPage(id), timeout || defaultTimeout);
        let selector = world.currentPage.config[_.camelCase(id)];
        yield driver.wait(until.notFoundInPage(selector), timeout || defaultTimeout);
        return Promise.resolve();
      });

      /************************** stuff *****************************/

      let routesPromise;

      this.loadRoutes = function() {
        let routes = [];
        return routesPromise || (routesPromise = new Promise(function (resolve) {
          loader.load(path.join(process.cwd(), '/**/features/routes/*.js'), function (route, name) {
              if (name.indexOf('node_modules') === -1) {
                routes.push(_.merge({component: name.substr(0, name.length - 3).replace(/^.*(\\|\/|\:)/, '')}, route));
              }
            })
            .then(function () {
              resolve(routes);
            });
        }))
      };

      this.__matchedRoute = function(routes, val) {
        let matched = false;
        routes.some(function (route) {
          if (!route.path) {
            return matched;
          }
          return (_.isArray(route.path) ? route.path : [route.path]).some(function (path) {
            let parts = path.split('/').map(function (part, index) {
              if (part[0] === ':') {
                return val.split('/')[index];
              } else {
                return part;
              }
            });
            if (val === parts.join('/')) {
              matched = route;
            }
            return matched;
          });
        });
        return matched;
      };

      this.getRoute = (val, prop) => ( new Promise(function (resolve, reject) {
        prop = prop || 'component';
        val = (prop === 'component') ? _.camelCase(val) : val;
        world.loadRoutes()
          .then((routes) => {
            let route = _(routes).find((route) => route[prop] === val);
            if (route) {
              resolve(route);
            } else if (prop === 'path') {
              resolve(world.__matchedRoute(routes, val));
            } else {
              resolve();
            }
          })
          .catch(reject)
      }));

      this.buildPageObject = function(pageConfig) {
        pageConfig = _.defaultsDeep(basePageObject, pageConfig);
        let pageObject = {
          this: this,
          config: pageConfig
        };
        _.each(pageConfig, function (val, prop) {
          if (_.isFunction(val)) {
            pageObject[prop] = val.bind(pageObject);
          }
        });
        return pageObject;
      };

      this.__getPageObject = () => new Promise(function (resolve, reject) {
        world.__whenBrowserReady()
          .then((url) => world.getRoute(url.substr(config.host.length), 'path')
            .then(function (route) {
              if (!route) {
                throw new Error(`Route is not defined for "${url}"`);
              }
              let pageObject = world.buildPageObject.call(this, route.pageObject);
              if (pageObject) {
                pageObject.route = route;
                world.currentPage = pageObject;
                return resolve(pageObject);
              }
            }))
          .catch(reject)
      });


      this.webdriver = webdriver;
      this.driver = driver;
    }

    click(id) {
      return this.find(id)
        .then(el => this.__whenVisible(el))
        .then(el => el.click());
    }

    sendKeys(id, text) {
      return this.find(id)
        .then(el => this.__whenVisible(el))
        .then(el => el.sendKeys(text));
    }

    getHtml(id) {
      return this.find(id)
        .then(el => el.getAttribute('outerHTML'));
    }

    select(id, query) {
      return this.getHtml(id)
        .then(html => cheerio.load(html)(':first-child ' + (query || '')));
    }

    getText(id) {
      return this.find(id)
        .then(el => this.__whenVisible(el))
        .then(el => el.getText());
    }

    getVal(id) {
      return this.find(id)
        .then(el => this.__whenVisible(el))
        .then(el => el.getAttribute('value'));
    }

    whenVisible(id) {
      return this.find(id)
        .then(el => this.__whenVisible(el))
        .then(el => Promise.resolve());
    }

    whenTextMatches(id, text) {
      return this.find(id)
        .then(el => this.__whenVisible(el))
        .then(el => this.__whenMatches(el, text))
        .then(el => Promise.resolve());
    }

    setSize(width, height) {
      return Promise.resolve(driver.manage().window().setSize(width, height));
    }

    visit(page, params) {
      return this.getRoute(page)
        .then((route) => {
          if (!route) {
            throw new Error(`Route is not defined for "${page}" page`);
          }
          let path;
          if (params) {
            let p = params ? params.split(',') : [];
            let parts = route.path.split('/').map((part) => (part[0] === ':') ? _.kebabCase(p.shift()) : part);
            path = config.host + parts.join('/');
          } else {
            path = config.host + (_.isArray(route.path) ? route.path[0] : route.path);
          }
          return driver.get(path);
        });
    }

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
