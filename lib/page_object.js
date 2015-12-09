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
    getTitle: function () {
        return this.world.driver.getTitle();
    },
    expectPageTitle: function (title, next) {
        var repeat = (count) => this.getTitle()
            .then((pageTitle) => {
                if (pageTitle === title) {
                    next();
                } else if (count > 0) {
                    setTimeout(repeat, 300);
                    count--;
                } else {
                    pageTitle.should.equal(title);
                    next();
                }
            });
        repeat(3); // Have three attempts before giving up
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
        this.world.driver.wait(() => new until.Condition('matching page', () => this.world.currentPage.route === route), 100).then(() => next());
    }
};