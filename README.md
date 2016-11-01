#tamarin

<p align="left">
  <a href="https://www.npmjs.com/package/tamarin"><img src="https://img.shields.io/npm/v/tamarin.svg" alt="npm version"></a>
  <a href="https://travis-ci.org/ajaxscape/tamarin"><img src="https://img.shields.io/travis/ajaxscape/tamarin/master.svg" alt="Travis"></a>
  <a href="https://coveralls.io/github/ajaxscape/tamarin"><img src="https://coveralls.io/repos/github/ajaxscape/tamarin/badge.svg" alt="Coverage"></a>
  <a href="https://snyk.io/test/npm/tamarin"><img src="https://snyk.io/test/npm/tamarin/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/npm/tamarin" style="max-width:100%;"></a>
  <a href="https://david-dm.org/ajaxscape/tamarin"><img src="https://david-dm.org/ajaxscape/tamarin/status.svg" alt="dependencies status"></a>
  <a href="https://david-dm.org/ajaxscape/tamarin"><img src="https://david-dm.org/ajaxscape/tamarin/dev-status.svg" alt="devDependencies status"></a>
</p>

I had two motivations behind Tamarin.  The first was to convert the steps behind my cucumber tests from ruby to javascript _(It seems these days that the front-end javascript developers end up maintaining the ruby steps .... and they hate it!)_ and the second was to simplify those steps to only include the actual tests and not all that extra code just to make the tests work consistently.  

To do this I asked myself __As a user would I ever click on an invisible link, type in a disabled field or select an item from a dynamically loaded dropdown that hadn't loaded yet?__  My answer was __of course I wouldn't!__ so why do we have to write tests to make sure this doesn't happen?  What if all that extra code was abstracted away and all you had to do was implement a one-line "click" and everything else was taken care of?
That was the idea behind Tamarin.  A little monkey behind the scenes doing all the hard work for you.

As an extension to [Cucumber.js](https://www.npmjs.com/package/cucumber), __tamarin__ allows the tester/developer to concentrate on the functionality that needs to be tested rather than the boiler-plate code around it in order for the test to work.

An example of how to use __tamarin__ can be found in the project [tamarin-example](https://github.com/ajaxscape/tamarin-example).

Note the following feature file taken from the example:

```gherkin
Feature: Do a Google Search
  Using a web browser
  I want to perform a Google search

  Scenario: Google Search
    Given I visit http://google.com
    Then I expect the title to be "Google"
    When I search for "Tamarin"
    When I click the "Images" menu link
    Then I expect to see some "Image" results
```

The corresponding step definitions file is as follows:

```javascript
'use strict'

const page = {
  'search': { css: '[title="Search"]' },
  'navLink': (linkText) => ({ xpath: `//*[@role="navigation"]//a[text()="${linkText}"]` }),
  'results': (type, searchTerm) => ({ css: `img[alt="${type} result for ${searchTerm}"]` })
}

module.exports = function () {
  this.Given(/^I visit (https?:\/\/.*\..*)$/, function visitStep (url) {
    return this.visit(url)
  })

  this.Then(/^I expect the title to be "([^"]*)"$/, function waitForTitleStep (title) {
    return this.waitForTitle(title)
  })
  
  this.When(/^I search for "([^"]*)"$/, function enterSearchTermStep (searchTerm) {
    return this.setData('searchTerm', searchTerm)
      .then(() => this.sendKeys(page.search, searchTerm + '\n'))
  })

  this.When(/^I click the "([^"]*)" menu link$/, function clickMenuLinkStep (linkText) {
    return this.click(page.navLink(linkText))
  })

  this.Then(/^I expect to see some "([^"]*)" results$/, function waitForResultsStep (type) {
    return this.getData('searchTerm')
      .then((searchTerm) => this.waitFor(page.results(type, searchTerm)))
  })
}
```

Under the hood, __tamarin__ waits until an element exists, is visible and enabled prior to performing such actions such as clicking a button or keying text into an input field.

## API
__tamarin__ adds the following functions to the __cucumber.js__ world object:
* setData (key, val)
* getData (key) .. _returns a promise resolving to the val of the key value pair_
* sleep (delay) .. _returns a promise_
* visit (url) .. _returns a promise_
* waitForTitle (title) .._returns a promise resolving to true if found_
* waitForCookie (cookieName) .._returns a promise resolving to a cookie_
* waitForUrl () .._returns a promise resolving to the current url_
* waitFor (selector/web element) .._returns a promise resolving to a web element_
* whenExists (selector/web element) .._returns a promise resolving to a web element_
* whenEnabled (selector/web element) .._returns a promise resolving to a web element_
* whenDisabled (selector/web element) .._returns a promise resolving to a web element_
* whenVisible (selector/web element) .._returns a promise resolving to a web element_
* whenHidden (selector/web element) .._returns a promise resolving to a web element_
* whenMatches (selector/web element, val) .._returns a promise resolving to a web element_
* whenContains (selector/web element, val) .._returns a promise resolving to a web element_
* sendKeys (selector/web element, value) .._returns a promise resolving to a web element_
* hover (selector/web element, delay) .._returns a promise resolving to a web element_
* click (selector/web element) .._returns a promise resolving to a web element_
* getText (selector/web element) .._returns a promise resolving to the text within the web element_
* getVal (selector/web element) .._returns a promise resolving to the value of the web element_

## Install

### Node

Tamarin is available as an npm module.

``` shell
$ npm i tamarin -D
```
