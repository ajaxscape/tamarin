'use strict'

const defaults = require('../lib/defaults')
const chai = require('chai')

chai.should()

describe('defaults', function () {
  it('expected defaults', function () {
    defaults.should.have.property('defaultTimeout')
    defaults.should.have.property('defaultRetryDelay')
  })
})
