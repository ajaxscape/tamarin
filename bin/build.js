const fs = require('fs')
const _ = require('lodash')
const Spinner = require('cli-spinner').Spinner
const exec = require('child_process').exec

/* ========================================= features/support/driver.js ============================================ */
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

/* ========================================= features/support/env.js =============================================== */
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

/* ========================================== features/support/hook.js ============================================= */
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

/* ======================================== features/support/world.js ============================================== */
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

/* ============================================ features/main.feature ============================================== */
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

/* ==================================== features/step_definitions/steps.js ========================================= */
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

function generate (dir, node) {
  const keys = Object.keys(node)
  keys.forEach((id) => {
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

function installDependencies (modules) {
  const command = `npm install ${modules.join(' ')} -D`
  const spinner = new Spinner('%s')
  console.log(command)
  console.log('This could take some time...')
  spinner.setSpinnerString('|/-\\')
  spinner.start()
  const stream = exec(command).stdout.pipe(process.stdout)
  stream.on('finish', () => spinner.stop())
}

module.exports = function () {
  generate(process.cwd(), {
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
  })

  installDependencies([
    'tamarin',
    'cucumber',
    'chai',
    'chai-as-promised',
    'chromedriver'
  ])
}

