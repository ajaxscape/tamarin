'use strict'

const tamarinUntil = require('../lib/until')
const _ = require('lodash')
const chai = require('chai')

chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'))
  .should()

const expect = chai.expect

describe('until', function () {
  it('must have world', function () {
    expect(tamarinUntil).to.throw('World must be defined')
  })

  it('can be extended', function () {
    const world = {
      id: 'foo'
    }
    const originalUntil = {
      id: 'bar'
    }
    const until = tamarinUntil(world, originalUntil)
    until.id.should.equal(originalUntil.id)
    expect(_.isFunction(until.foundInPage)).to.equal(true)
    expect(_.isFunction(until.notFoundInPage)).to.equal(true)
    expect(_.isFunction(until.browserReady)).to.equal(true)
  })

  describe('condition', function () {
    let found
    let url
    let cookie
    const title = 'test title'

    const world = {
      getDriver: function () {
        return Promise.resolve({
          findElement: () => found ? Promise.resolve() : Promise.reject(),
          getTitle: () => Promise.resolve(title),
          getCurrentUrl: () => Promise.resolve(url),
          manage: () => ({ getCookie: (cookieName) => cookie ? Promise.resolve(cookie) : Promise.reject()})
        })
      }
    }

    const until = tamarinUntil(world)

    describe('foundInPage', function () {
      const foundInPage = until.foundInPage().fn

      it('resolved', function () {
        found = true
        return foundInPage('abc').should.eventually.equal(true)
      })

      it('rejected', function () {
        found = false
        return foundInPage().should.eventually.equal(false)
      })
    })

    describe('notFoundInPage', function () {
      const notFoundInPage = until.notFoundInPage().fn

      it('resolved', function () {
        found = false
        return notFoundInPage().should.eventually.equal(true)
      })

      it('rejected', function () {
        found = true
        return notFoundInPage().should.eventually.equal(false)
      })
    })

    describe('browserReady', function () {
      const browserReady = until.browserReady().fn

      it('resolved', function () {
        url = '/'
        return browserReady().should.eventually.equal(true)
      })

      it('rejected', function () {
        url = 'data:,'
        return browserReady().should.eventually.equal(false)
      })
    })

    describe('cookieExists', function () {
      const cookieExists = until.cookieExists().fn

      it('resolved', function () {
        cookie = { value: 'foo' }
        return cookieExists().should.eventually.equal(true)
      })

      it('rejected', function () {
        cookie = undefined
        return cookieExists().should.eventually.equal(false)
      })
    })
  })
})
