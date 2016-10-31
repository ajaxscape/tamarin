'use strict'

const defaults = require('../lib/defaults')
const expect = require('chai').expect

describe('defaults', function () {
  it('instantiates default driver', function () {
    defaults.getDriver((driver) => expect(driver).to.exist())
  })
})
