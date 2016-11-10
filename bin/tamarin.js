#!/usr/bin/env node

/**
 * Module dependencies.
 */

const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const program = require('commander')

function findInParent (dir, filename) {
  if (!dir) {
    dir = path.dirname(module.parent.filename)
  }
  var file = path.resolve(dir, filename)
  if (fs.existsSync(file) && fs.statSync(file).isFile()) {
    return file
  }
  var parent = path.resolve(dir, '..')
  if (parent === dir) {
    return null
  }
  return findInParent(parent, filename)
}

const packageJson = JSON.parse(fs.readFileSync(findInParent(__dirname, 'package.json'), 'utf8'))

program.version(packageJson.version)
  .option('-b, --build', 'Build example features')
  .option('-t, --test', 'Start test', /^([^"]*)$/)
  .parse(process.argv)

if (process.argv.length < 3) {
  program.help()
}

if (program.build) {
  require('./build')()
}

if (program.test) {
  const command = findInParent(process.cwd(), 'package.json').split('/').map((item) => (item === 'package.json' ? 'node_modules/cucumber/bin/cucumber.js' : item)).join('/')
  console.log(command)
  const stream = exec(command)
  stream.stdout.pipe(process.stdout)
  stream.stderr.pipe(process.stderr)
}
