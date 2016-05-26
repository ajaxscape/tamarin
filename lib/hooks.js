'use strict'

const tamarin = require('./world')
const driver = tamarin.getDriver()
const fs = require('fs')
const path = require('path')
const sanitize = require('sanitize-filename')

require('chai')
  .use(require('chai-things'))
  .use(require('chai-as-promised'))
  .should()

const myHooks = function () {
  this.Before(function (scenario, next) {
    next()
  })

  this.After(function (scenario, next) {
    if (scenario.isFailed()) {
      driver.takeScreenshot()
        .then(function (data) {
          const base64Data = data.replace(/^data:image\/pngbase64,/, '')
          fs.writeFile(path.join('screenshots', sanitize(scenario.getName() + '_' + Date.now() + '.png').replace(/ /g, '_')), base64Data, 'base64', function (err) {
            if (err) {
              console.log(err)
            }
          })
        })
    }
    next()
    // return this.driver.manage().deleteAllCookies()
    //   .then(() => this.driver.quit())
  })

  this.AfterFeatures(function () {
    return driver.quit()
  })
}

module.exports = myHooks

