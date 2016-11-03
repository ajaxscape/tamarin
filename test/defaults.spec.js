'use strict'

const defaults = require('../lib/defaults')
const expect = require('chai').expect

describe('defaults', function () {
  it('throws a driver expected error', function () {
    expect(defaults.getDriver().to.throw(new Error('Expected a driver to be passed in the world constructor!')))
  })
})
