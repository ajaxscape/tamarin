<h1 align="middle">Tamarin</h1>

<img align="left" src="https://raw.githubusercontent.com/ajaxscape/tamarin/master/tamarin.png" width="256px">

<p align="left">
  <a href="https://www.npmjs.com/package/tamarin"><img src="https://img.shields.io/npm/v/tamarin.svg" alt="npm version"></a>
  <a href="https://travis-ci.org/ajaxscape/tamarin"><img src="https://img.shields.io/travis/ajaxscape/tamarin/master.svg" alt="Travis"></a>
  <a href="https://www.bithound.io/github/ajaxscape/tamarin"><img src="https://www.bithound.io/github/ajaxscape/tamarin/badges/code.svg" alt="bitHound Code"></a>
  <a href="https://www.bithound.io/github/ajaxscape/tamarin"><img src="https://www.bithound.io/github/ajaxscape/tamarin/badges/score.svg" alt="bitHound Overall Score"></a>
  <a href="https://coveralls.io/github/ajaxscape/tamarin"><img src="https://coveralls.io/repos/github/ajaxscape/tamarin/badge.svg" alt="Coverage"></a>
  <a href="https://snyk.io/test/npm/tamarin"><img src="https://snyk.io/test/npm/tamarin/badge.svg" alt="Known Vulnerabilities" data-canonical-src="https://snyk.io/test/npm/tamarin" style="max-width:100%;"></a>
  <a href="https://www.bithound.io/github/ajaxscape/tamarin/master/dependencies/npm"><img src="https://www.bithound.io/github/ajaxscape/tamarin/badges/dependencies.svg" alt="bitHound Dependencies"></a>
  <a href="https://www.bithound.io/github/ajaxscape/tamarin/master/dependencies/npm"><img src="https://www.bithound.io/github/ajaxscape/tamarin/badges/devDependencies.svg" alt="bitHound Dev Dependencies"></a>
</p>

__Tamarin__ allows the tester/developer to concentrate on the functionality that needs to be tested rather than the boiler-plate code around it in order for the test to work.

I have often asked myself __As a user would I ever click on an invisible link, type in a disabled field or select an item from a dynamically loaded dropdown that hadn't loaded yet?__  My answer was __of course I wouldn't!__ so why do we have to write tests to make sure this doesn't happen?  What if all that extra code was abstracted away and all you had to do was implement a one-line "click" and everything else was taken care of?

Note the following files taken from the example project: [tamarin-vanilla-example](https://github.com/ajaxscape/tamarin-vanilla-example).


__index.js__
```javascript
const googleSearch = require('./google_search')
googleSearch.test()
    .then(() => {
      console.log('Google search completed successfully')
      googleSearch.quit()
    })
    .catch((err) => {
      console.error('Google search failed')
      googleSearch.quit()
      throw err
    })
```

__google_search.js__
```javascript
const World = require('./world').World
const world = new World()

const page = {
  'search': { css: '[title="Search"]' },
  'navLink': { xpath: '//*[@role="navigation"]//a[text()="Images"]' },
  'results': { css: 'img[alt="Image result for Tamarin"]' }
}

module.exports = {
  quit: () => world.quit(),
  test: () => world.visit('http://google.com')
    .then(() => world.waitForTitle('Google'))
    .then(() => world.sendKeys(page.search, 'Tamarin' + '\n'))
    .then(() => world.click(page.navLink))
    .then(() => world.waitFor(page.results))
}
```

__world.js__
```javascript
'use strict'

const driver = require('./driver')
const tamarin = require('tamarin')

module.exports = {
  World: class extends tamarin {
    constructor () {
      super(driver())
    }
    quit () {
      return this.getDriver()
        .then((driver) => driver.quit())
    }
  }
}
```

__driver.js__
```javascript
'use strict'

const webDriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const service = new chrome.ServiceBuilder(require('chromedriver').path).build()
chrome.setDefaultService(service)

module.exports = function () {
  return new webDriver.Builder()
    .withCapabilities(webDriver.Capabilities.chrome())
    .build()
}
```

Under the hood, __tamarin__ waits until an element exists, is visible and enabled prior to performing such actions such as clicking a button or keying text into an input field.

## API
__tamarin__ contains the following functions within the tamarin world object:
* setData (key, val)
* getData (key) .. _returns a promise resolving to the val of the key value pair_
* sleep (delay) .. _returns a promise_
* visit (url) .. _returns a promise_
* waitForTitle (title) .._returns a promise resolving to true if found_
* waitForCookie (cookieName) .._returns a promise resolving to a cookie_
* waitForUrl () .._returns a promise resolving to the current url_
* waitFor (selenium_selector) .._returns a promise resolving to a web element_
* whenExists (selenium_selector) .._returns a promise resolving to a web element_
* whenEnabled (selenium_selector) .._returns a promise resolving to a web element_
* whenDisabled (selenium_selector) .._returns a promise resolving to a web element_
* whenVisible (selenium_selector) .._returns a promise resolving to a web element_
* whenHidden (selenium_selector) .._returns a promise resolving to a web element_
* whenMatches (selenium_selector, val) .._returns a promise resolving to a web element_
* whenContains (selenium_selector, val) .._returns a promise resolving to a web element_
* sendKeys (selenium_selector, value) .._returns a promise resolving to a web element_
* hover (selenium_selector, delay) .._returns a promise resolving to a web element_
* click (selenium_selector) .._returns a promise resolving to a web element_
* getText (selenium_selector) .._returns a promise resolving to the text within the web element_
* getVal (selenium_selector) .._returns a promise resolving to the value of the web element_

## Install

### As a dependency

Tamarin is available as an npm module.

``` shell
$ npm i tamarin -D
```

More to come!