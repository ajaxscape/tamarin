'use strict';

var fs = require('fs'),
    webdriver = require('selenium-webdriver'),
    until = require('selenium-webdriver').until,
    chrome = require('selenium-webdriver/chrome'),
    path = require('chromedriver').path,
    _ = require('lodash'),
    basePageObject = {},
    defaultTimeout = 4000,
    config,
    routes,
    world;

var co = require('bluebird').coroutine;

var perform = function(fn){
    return _.isFunction(fn) ? fn : function(){};
};

var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

var driver = new webdriver.Builder().
withCapabilities(webdriver.Capabilities.chrome()).
//withCapabilities(webdriver.Capabilities.firefox()).
build();

var World = function World() {

    var screenshotPath = 'screenshots';

    this.webdriver = webdriver;
    this.driver = driver;

    if (!fs.existsSync(screenshotPath)) {
        fs.mkdirSync(screenshotPath);
    }

    world = this;

    until.pageMatches = function(page) {
        var route = world.getRoute(page);
        if (!route) {
            throw new Error('Route is not defined for "' + page + '" page');
        }
        return new until.Condition('for page to match ' + page, co(function* () {
            var page = yield world.getPageObject();
            return page.route.path === route.path;
        }));
    };

    until.configuredInPage = function(id) {
        var key = _.camelCase(id);
        return new until.Condition('for "' + key + '" to be configured in page ', co(function* () {
            var page = yield world.getPageObject();
            return page.config.hasOwnProperty(key);
        }));
    };

    until.foundInPage = function(selector) {
        return new until.Condition('for $(' + selector + ') to be found in page ', function() {
            return !!driver.findElement(webdriver.By.css(selector));
        });
    };

};

function matchedRoute(val) {
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

World.prototype.getRoute = function (val, prop) {
    prop = prop || 'component';
    val = (prop === 'component') ? _.camelCase(val) : val;
    var route = _(routes).find(function (route) {
        return route[prop] === val;
    });
    if (route) {
        return route;
    } else if (prop === 'path') {
        return matchedRoute(val);
    }
};

World.prototype.visit = function (page, params) {
    var route = this.getRoute(page);
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
    return driver.get(path);

};

World.prototype.setSize = function (width, height) {
    return Promise.resolve(driver.manage().window().setSize(width, height));
};

World.prototype.getPageObject = function () {
    return new Promise(function (resolve, reject) {
        world.driver.getCurrentUrl().then(function (url) {
            var route = world.getRoute(url.substr(config.host.length), 'path');
            if (route) {
                var pageObject = buildPageObject.call(world, route.pageObject);
                if (pageObject) {
                    pageObject.route = route;
                    world.currentPage = pageObject;
                    return resolve(pageObject);
                }

            }
            reject(new Error('Failed to build page object for ' + url));
        });
    });
};

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

World.prototype.waitForPage = function (page, timeout, next) {
    return driver.wait(until.pageMatches(page), timeout || defaultTimeout)
        .then(perform(next));
};

/* Find the id in the config and use the selector to find the element and wait until itr is visible */
World.prototype.find = co(function* (id) {
    yield driver.wait(until.configuredInPage(id), defaultTimeout);
    var selector = world.currentPage.config[_.camelCase(id)];
    yield driver.wait(until.foundInPage(selector), defaultTimeout);
    return driver.findElement(webdriver.By.css(selector));
});

World.prototype.click = function(id){
    return this.find(id)
        .then(el => el.click());
};

World.prototype.sendKeys = function(id, text){
    return this.find(id)
        .then(el => el.sendKeys(text));
};

World.prototype.getText = function(id){
    return this.find(id)
        .then(el => el.getText());
};

World.prototype.getVal = function(id){
    return this.find(id)
        .then(el => el.getAttribute('value'));
};

/************************ module exports ***************************/

module.exports.World = World;
module.exports.getDriver = function () {
    return driver;
};
module.exports.getCurrentWorld = function () {
    return world;
};
module.exports.setConfig = function (myConfig) {
    config = myConfig;
};
module.exports.setRoutes = function (myRoutes) {
    routes = myRoutes;
};
module.exports.setPageConfig = function (pageConfig) {
    basePageObject = _.defaultsDeep(basePageObject, pageConfig);
};
