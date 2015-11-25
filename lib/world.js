'use strict';

var fs = require('fs'),
    webdriver = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    path = require('chromedriver').path,
    _ = require('lodash'),
    basePageObject = require('./page_object'),
    defaultTimeout = 2000,
    config,
    routes;

var service = new chrome.ServiceBuilder(path).build();
    chrome.setDefaultService(service);

var driver = new webdriver.Builder().
    withCapabilities(webdriver.Capabilities.chrome()).
    //withCapabilities(webdriver.Capabilities.firefox()).
    build();

var getDriver = function () {
    return driver;
};

var World = function World(callback) {

    var screenshotPath = 'screenshots';

    this.webdriver = webdriver;
    this.driver = driver;

    if (!fs.existsSync(screenshotPath)) {
        fs.mkdirSync(screenshotPath);
    }

    this.waitFor = function (cssLocator, timeout) {
        var waitTimeout = timeout || defaultTimeout;
        return driver.wait(function () {
            return driver.isElementPresent({css: cssLocator});
        }, waitTimeout);
    };

    callback();
};

function matchedRoute(val) {
    var matched;
    routes.some(function (route) {
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
    this.pageObject = route.pageObject;
    return driver.get(path);
};

World.prototype.setSize = function (width, height) {
    driver.manage().window().setSize(width, height);
};

World.prototype.getPageObject = function () {
    var world = this;
    return new Promise(function (resolve, reject) {
        world.driver.getCurrentUrl().then(function (url) {
            var route = world.getRoute(url.substr(config.host.length), 'path');
            var pageObject = buildPageObject.call(world, route.pageObject);
            if (pageObject) {
                pageObject.route = route;
                resolve(pageObject);
            } else {
                reject(new Error('Failed to build page object for ' + url));
            }
        });
    });
};

World.prototype.findElement = function (selector, success, failure) {
    var world = this;
    if (arguments.length === 1) {
        return driver.findElement(webdriver.By.css(selector));
    } else {
        this.waitFor(selector, 500).then(function () {
            success(world.findElement(selector));
        }, failure);
    }
};

function buildPageObject(pageConfig) {
    pageConfig = _.defaultsDeep(basePageObject, pageConfig);
    var world = this;
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

module.exports.World = World;
module.exports.getDriver = getDriver;
module.exports.setConfig = function(myConfig){
    config = myConfig;
};
module.exports.setRoutes = function(myRoutes){
    routes = myRoutes;
};
