'use strict';

var _ = require('lodash');
var until = require('selenium-webdriver').until;

module.exports = {
    get: function (key, success, failure) {
        key = _.camelCase(key);
        var query = this.config[key];
        if (_.isUndefined(query)) {
            console.error('Cannot match ' + key + ' within page object config');
        } else if (success) {
            return this.world.findElement(query, success, failure);
        } else {
            return this.world.findElement(query);
        }
    },
    untilVisible: function(key) {
        return new Promise((resolve) => {
            this.world.currentPage.get(key, (el) =>  this.world.driver.wait(until.elementIsVisible(el)).then(() => resolve(el)));
        })
    },
    getTitle: function () {
        return this.world.driver.getTitle();
    },
    expectPageTitle: function (title, next) {
        this.world.driver.wait(until.titleMatches(new RegExp(title))).then(() => next());
    },
    expectPageToContain: function (id, next) {
        this.get(id, () => {
            next();
        }, () => {
            throw new Error('Element not found: "' + id + '"');
        });
    },
    expectPageToNotContain: function (id, next) {
        this.get(id, function () {
            throw new Error('Element unexpectedly found: "' + id + '"');
        }, () => next());
    },
    expectPageToEventuallyBe: function (page, next) {
        var route = this.world.getRoute(page);
        if (!route) {
            throw new Error('Route is not defined for "' + page + '" page');
        }
        this.world.driver.wait(() => new until.Condition('matching page', () => this.world.currentPage.route === route), 10000).then(() => next());
    }
};