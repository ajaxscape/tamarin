'use strict';

var fs = require('fs'),
    path = require('path'),
    webdriver = require('selenium-webdriver'),
    loader = require('node-glob-loader'),
    until = require('selenium-webdriver').until,
    chrome = require('selenium-webdriver/chrome'),
    _ = require('lodash'),
    basePageObject = {},
    defaultTimeout = 10000,
    config,
    routes,
    world,
    screenshotPath = 'screenshots';

var co = require('bluebird').coroutine;

var service = new chrome.ServiceBuilder(require('chromedriver').path).build();
chrome.setDefaultService(service);

var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).
//withCapabilities(webdriver.Capabilities.firefox()).
build();

if (!fs.existsSync(screenshotPath)) {
    fs.mkdirSync(screenshotPath);
}

/************************************* world constructor ******************************/

var World = function World() {
    world = this;
};

/************************ module exports ***************************/

module.exports.World = World;
module.exports.getDriver = () => driver;
module.exports.getCurrentWorld = () => world;
module.exports.setConfig = (myConfig) => config = myConfig;
module.exports.setPageConfig = (pageConfig) => basePageObject = _.defaultsDeep(basePageObject, pageConfig);
module.exports.env = require('../lib/env');
module.exports.hooks = require('../lib/hooks');

/***************************** extend until ******************************/

_.extend(until, {
    pageMatches: (page) => {
        var currentPage = page;
        return new until.Condition('for page to match ' + currentPage, co(function* () {
            var route = yield getRoute(currentPage);
            if (!route) {
                throw new Error('Route is not defined for "' + currentPage + '" page');
            }
            var page = yield getPageObject();
            return page.route.path === route.path;
        }));
    },
    configuredInPage: (id) => new until.Condition('for "' + id + '" to be configured in page ', co(function* () {
        var page = yield getPageObject();
        return page.config.hasOwnProperty(_.camelCase(id));
    })),
    foundInPage: (selector) => new until.Condition('for $(' + selector + ') to be found in page ', co(function* () {
        var isValid;
        yield driver.findElement(webdriver.By.css(selector))
            .then(() => isValid = true)
            .thenCatch((err) => isValid = false);
        return isValid;
    })),
    titleIs: (expectedTitle) => new until.Condition('for ' + expectedTitle + ' to match page title ', co(function* () {
        var title = yield driver.getTitle();
        return title === expectedTitle;
    })),
    browserReady: () => new until.Condition('for url to not equal data; ', co(function* () {
        var url = yield driver.getCurrentUrl();
        return url !== 'data:,';
    }))
});

/************************ co functions ***************************/


var whenVisible = co(function* (el, timeout) {
    yield driver.wait(until.elementIsEnabled(el), timeout || defaultTimeout);
    yield driver.wait(until.elementIsVisible(el), timeout || defaultTimeout);
    return Promise.resolve(el);
});

var whenMatches = co(function* (el, text, timeout) {
    yield driver.wait(until.elementTextIs(el, text), timeout || defaultTimeout);
    return Promise.resolve(el);
});

var whenTitleIs = co(function* (title, timeout) {
    yield driver.wait(until.titleIs(title), timeout || defaultTimeout);
    return Promise.resolve();
});

var whenPageIs = co(function* (page, timeout) {
    yield driver.wait(until.pageMatches(page), timeout || defaultTimeout);
    return Promise.resolve();
});

var whenRoutesLoaded = co(function* (timeout) {
    yield driver.wait(until.pageMatches(page), timeout || defaultTimeout);
    return Promise.resolve();
});

var whenBrowserReady = co(function* (timeout) {
    yield driver.wait(until.browserReady(), timeout || defaultTimeout);
    var url = yield world.driver.getCurrentUrl();
    return Promise.resolve(url);
});

/* Find the id in the config and use the selector to find the element in the dom */
var find = co(function* (id, timeout) {
    yield driver.wait(until.configuredInPage(id), timeout || defaultTimeout);
    var selector = world.currentPage.config[_.camelCase(id)];
    yield driver.wait(until.foundInPage(selector), timeout || defaultTimeout);
    return driver.findElement(webdriver.By.css(selector))
});

/************************ World prototype **************************/

World.prototype.webdriver = webdriver;
World.prototype.driver = driver;
World.prototype.find = find;

World.prototype.whenPageIs = whenPageIs;
World.prototype.whenTitleIs = whenTitleIs;

World.prototype.click = (id) => find(id)
    .then(el => whenVisible(el))
    .then(el => el.click());

World.prototype.sendKeys = (id, text) => find(id)
    .then(el => whenVisible(el))
    .then(el => el.sendKeys(text));

World.prototype.getText = (id) => find(id)
    .then(el => whenVisible(el))
    .then(el => el.getText());

World.prototype.getVal = (id) => find(id)
    .then(el => whenVisible(el))
    .then(el => el.getAttribute('value'));

World.prototype.whenVisible = (id) => find(id)
    .then(el => whenVisible(el))
    .then(el => Promise.resolve());

World.prototype.whenTextMatches = (id, text) => find(id)
    .then(el => whenVisible(el))
    .then(el => whenMatches(el, text))
    .then(el => Promise.resolve());

World.prototype.setSize = (width, height) => Promise.resolve(driver.manage().window().setSize(width, height));

/************************** stuff *****************************/

var routesPromise;

function loadRoutes() {
    var routes = [];
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
}

function matchedRoute(routes, val) {
    var matched;
    routes.some(function (route) {
        if (!route.path) {
            return matched;
        }
        var parts = route.path.split('/').map(function (part, index) {
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
    return matched;
}

var getRoute = function (val, prop) {
    prop = prop || 'component';
    val = (prop === 'component') ? _.camelCase(val) : val;

    return new Promise(function (resolve, reject) {
        loadRoutes()
            .then((routes) => {
                var route = _(routes).find(function (route) {
                    return route[prop] === val;
                });
                if (route) {
                    resolve(route);
                } else if (prop === 'path') {
                    resolve(matchedRoute(routes, val));
                } else {
                    resolve();
                    //reject(new Error(`Failed to find route: ${prop} => ${val}` ));
                }
            })
            .catch(reject)
    })
};

World.prototype.visit = function (page, params) {
    return new Promise(function (resolve) {
        getRoute(page)
            .then((route) => {
                var path = config.host + route.path;
                if (params) {
                    var p = params ? params.split(',') : [];
                    var parts = route.path.split('/').map(function (part) {
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
            });
    })
};

var getPageObject = () => new Promise(function (resolve, reject) {
    whenBrowserReady()
        .then((url) => getRoute(url.substr(config.host.length), 'path')
            .then(function (route) {
                var pageObject = buildPageObject.call(world, route.pageObject);
                if (pageObject) {
                    pageObject.route = route;
                    world.currentPage = pageObject;
                    return resolve(pageObject);
                }
            }))
        .catch(reject)
});

function buildPageObject(pageConfig) {
    pageConfig = _.defaultsDeep(basePageObject, pageConfig);
    var pageObject = {
        world: world,
        config: pageConfig
    };
    _.each(pageConfig, function (val, prop) {
        if (_.isFunction(val)) {
            pageObject[prop] = val.bind(pageObject);
        }
    });
    return pageObject;
}
