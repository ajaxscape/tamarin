'use strict'

const { WebElement } = require('selenium-webdriver')
const { World } = require('./world')

Object.assign(WebElement, World)

module.exports = WebElement
