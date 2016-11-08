#!/usr/bin/env node

const fs = require('fs')
const _ = require('lodash')
const exec = require('child_process').exec

const driver = `
'use strict'

const webDriver = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const service = new chrome.ServiceBuilder(require('chromedriver').path).build()
chrome.setDefaultService(service)

const driver = new webDriver.Builder()
  .withCapabilities(webDriver.Capabilities.chrome())
  .build()

module.exports = driver
`

const env = `
'use strict'

require('chai')
  .use(require('chai-as-promised'))
  .should()

var configure = function () {
  this.setDefaultTimeout(60 * 1000)
}

module.exports = configure
`

const hook = `
'use strict'

module.exports = function () {
  const driver = require('./driver')
  this.World = require('./world').World // overwrite default World constructor
  this.setDefaultTimeout(3600000)

  this.AfterFeatures(function () {
    return driver.quit()
  })
}
`

const world = `'use strict'

const driver = require('./driver')
const tamarin = require('tamarin')

module.exports = {
  World: class extends tamarin {
    constructor () {
      super(driver)
    }
  }
}
`

const feature = `
Feature: Do a Google Search
  Using a web browser
  I want to perform a Google search

  Scenario: Google Search for tamarin images
    Given I visit http://google.com
    Then I expect the title to be "Google"
    When I search for "Tamarin"
    When I click the "Images" menu link
    Then I expect to see some "Image" results
`

const steps = `
'use strict'

const page = {
  'search': { css: '[title="Search"]' },
  'navLink': (linkText) => ({ xpath: \`//*[@role="navigation"]//a[text()="\${linkText}"]\` }),
  'results': (type, searchTerm) => ({ css: \`img[alt="\${type} result for \${searchTerm}"]\` })
}

module.exports = function () {
  this.Given(/^I visit (https?:\\/\\/.*\\..*)$/, function visitStep (url) {
    return this.visit(url)
  })

  this.Then(/^I expect the title to be "([^"]*)"$/, function waitForTitleStep (title) {
    return this.waitForTitle(title)
  })

  this.Then(/^I expect the "([^"]*)" cookie to exist$/, function waitForTitleStep (name) {
    return this.waitForCookie(name)
  })

  this.Then(/^I expect the "([^"]*)" cookie to be "([^"]*)"$/, function waitForTitleStep (name, expectedValue) {
    return this.waitForCookie(name).should.eventually.have.property('value', expectedValue)
  })

  this.Then(/^I expect the url to contain "([^"]*)"$/, function (partial) {
    return this.waitForUrl().should.eventually.contain(partial)
  })
  
  this.When(/^I search for "([^"]*)"$/, function enterSearchTermStep (searchTerm) {
    return this.setData('searchTerm', searchTerm)
      .then(() => this.sendKeys(page.search, searchTerm + '\\n'))
  })

  this.When(/^I click the "([^"]*)" menu link$/, function clickMenuLinkStep (linkText) {
    return this.click(page.navLink(linkText))
  })

  this.Then(/^I expect to see some "([^"]*)" results$/, function waitForResultsStep (type) {
    return this.getData('searchTerm')
      .then((searchTerm) => this.waitFor(page.results(type, searchTerm)))
  })
}
`

const structure = {
  features: {
    support: {
      'driver.js': driver,
      'env.js': env,
      'hook.js': hook,
      'world.js': world
    },
    step_definitions: {
      'steps.js': steps
    },
    'main.feature': feature
  }
}

function generate (dir, node) {
  const keys = Object.keys(node)
  keys.forEach((id) => {
    console.log(`Processing: ${id}`)
    if (_.isString(node[id])) {
      const filename = `${dir}/${id}`
      console.log(`saving ${filename}`)
      fs.writeFileSync(filename, node[id])
    } else {
      const subDir = `${dir}/${id}`
      if (!fs.existsSync(subDir)) {
        fs.mkdirSync(subDir)
      }
      generate(subDir, node[id])
    }
  })
}

generate(process.cwd(), structure)

const modules = [
  'tamarin',
  'cucumber',
  'chai',
  'chai-as-promised',
  'chromedriver'
]
modules.forEach((module) =>
  exec(`npm install ${module}`).stderr.pipe(process.stderr)
)

