'use strict'
const webDriver = require('selenium-webdriver')
const WebElement = webDriver.WebElement
const cor = require('../lib/co-routines')
const defaults = require('../lib/defaults')
const TamarinWorld = require('../lib/world')
const chai = require('chai')
const sinon = require('sinon')

require('events').EventEmitter.defaultMaxListeners = Infinity

chai
  .use(require('chai-things'))
  .use(require('chai-as-promised'))
  .should()

const expect = chai.expect

describe('co-routines', function () {
  it('must have world', function () {
    expect(cor.get).to.throw('World must be defined')
  })

  it('get must return the default timeout', function () {
    expect(cor.get(new TamarinWorld()).getTimeout()).to.be.equal(defaults.defaultTimeout)
  })

  it('must have a valid timeout if entered', function () {
    expect(() => cor.get(new TamarinWorld(), 'abc')).to.throw('Default Timeout must be a number')
  })

  describe('valid world', function () {
    const html = '<h1>Hello</h1>'
    let cookie
    let world
    let coRoutines
    let el

    beforeEach(function () {
      cookie = { value: 'foobar' }
      world = new TamarinWorld()
      el = {
        getOuterHtml: () => Promise.resolve(html)
      }
    })

    describe('resolved', function () {
      beforeEach(function () {
        sinon.stub(world, 'getDriver').returns(Promise.resolve({
          getCurrentUrl: () => Promise.resolve('/ready'),
          findElement: (selector) => {
            if (typeof selector === 'object') {
              return Promise.resolve(el)
            } else {
              return Promise.reject(new Error('findElement failed'))
            }
          },
          manage: () => ({
            getCookie: () => Promise.resolve(cookie)
          }),
          wait: (fn) => fn
        }))
        sinon.stub(world, 'getUntil').returns({
          elementsLocated: () => Promise.resolve(true),
          elementIsEnabled: () => Promise.resolve(true),
          elementIsDisabled: () => Promise.resolve(true),
          elementIsVisible: () => Promise.resolve(true),
          elementIsNotVisible: () => Promise.resolve(true),
          elementTextIs: () => Promise.resolve(true),
          elementTextContains: () => Promise.resolve(true),
          titleIs: () => Promise.resolve(true),
          cookieExists: () => Promise.resolve(true),
          browserReady: () => Promise.resolve(true)
        })
        coRoutines = cor.get(world, 100)
      })

      afterEach(function () {
        world.getUntil.restore()
        world.getDriver.restore()
      })

      it('findElement', function () {
        return coRoutines.findElement(el).should.eventually.be.equal(el)
      })

      it('findElement as WebElement', function () {
        return coRoutines.findElement(new WebElement()).should.eventually.deep.equal(new WebElement())
      })

      it('whenExists', function () {
        return coRoutines.whenExists(el).should.eventually.be.equal(el)
      })

      it('whenEnabled', function () {
        return coRoutines.whenEnabled(el).should.eventually.be.equal(el)
      })

      it('whenDisabled', function () {
        return coRoutines.whenDisabled(el).should.eventually.be.equal(el)
      })

      it('whenVisible', function () {
        return coRoutines.whenVisible(el).should.eventually.be.equal(el)
      })

      it('whenHidden', function () {
        return coRoutines.whenHidden(el).should.eventually.be.equal(el)
      })

      it('whenMatches', function () {
        return coRoutines.whenMatches(el).should.eventually.be.equal(el)
      })

      it('whenMatches', function () {
        return coRoutines.whenContains(el).should.eventually.be.equal(el)
      })

      it('waitFor', function () {
        return coRoutines.waitFor(el).should.eventually.be.equal(el)
      })

      it('waitForTitle', function () {
        return coRoutines.waitForTitle('title').should.eventually.be.equal(true)
      })

      it('waitForBrowser', function () {
        return coRoutines.waitForBrowser().should.eventually.be.equal('/ready')
      })

      it('waitForCookie', function () {
        return coRoutines.waitForCookie().should.eventually.be.equal(cookie)
      })

      it('waitForCookie has no value', function () {
        cookie = {} // set cookie with no value
        const cookieName = 'foo'
        return coRoutines.waitForCookie(cookieName)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.equal(`Cookie "${cookieName}" doesn't exist`))
      })
    })

    describe('rejected', function () {
      let findElementFailure
      beforeEach(function () {
        findElementFailure = false
        sinon.stub(world, 'getDriver').returns(Promise.resolve({
          getCurrentUrl: () => Promise.resolve('/ready'),
          findElement: () => findElementFailure ? Promise.reject({message: 'Not Found'}) : Promise.resolve(el),
          wait: (fn) => fn,
          manage: () => ({getCookie: () => Promise.resolve(cookie)})
        }))
        sinon.stub(world, 'getUntil').returns({
          elementsLocated: () => Promise.reject({message: 'Not Located'}),
          elementIsEnabled: () => Promise.reject({message: 'Not Enabled'}),
          elementIsDisabled: () => Promise.reject({message: 'Not Disabled'}),
          elementIsVisible: () => Promise.reject({message: 'Not Visible'}),
          elementIsNotVisible: () => Promise.reject({message: 'Is Visible'}),
          elementTextIs: () => Promise.reject({message: 'Not Matching Text'}),
          elementTextContains: () => Promise.reject({message: 'Not Contains Text'}),
          titleIs: () => Promise.reject({message: 'Not Matching Title'}),
          browserReady: () => Promise.reject({message: 'Not Ready'}),
          cookieExists: () => Promise.reject({message: 'Not Cookie Exists'})
        })
        sinon.stub(console, 'error').returns(() => {})
        coRoutines = cor.get(world, 100)
      })

      afterEach(function () {
        world.getUntil.restore()
        world.getDriver.restore()
        console.error.restore()
      })

      it('findElement', function () {
        findElementFailure = true
        return coRoutines.findElement(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Found'))
      })

      it('whenExists', function () {
        return coRoutines.whenExists(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Located'))
      })

      it('whenEnabled', function () {
        return coRoutines.whenEnabled(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Enabled'))
      })

      it('whenDisabled', function () {
        return coRoutines.whenDisabled(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Disabled'))
      })

      it('whenVisible', function () {
        return coRoutines.whenVisible(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Visible'))
      })

      it('whenHidden', function () {
        return coRoutines.whenHidden(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Is Visible'))
      })

      it('whenMatches', function () {
        return coRoutines.whenMatches(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Matching Text'))
      })

      it('whenContains', function () {
        return coRoutines.whenContains(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Contains Text'))
      })

      it('waitFor', function () {
        return coRoutines.waitFor(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Visible'))
      })

      it('waitForTitle', function () {
        return coRoutines.waitForTitle(el)
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Matching Title'))
      })

      it('waitForBrowser', function () {
        return coRoutines.waitForBrowser()
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Ready'))
      })

      it('waitForCookie', function () {
        return coRoutines.waitForCookie()
          .catch((err) => expect(Promise.resolve(err.message)).to.eventually.contain('Not Cookie Exists'))
      })
    })
  })
})
