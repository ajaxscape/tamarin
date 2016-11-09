#!/usr/bin/env node

/**
 * Module dependencies.
 */

const fs = require('fs')
const program = require('commander')
const build = require('./build')

const packageFile = fs.readFileSync(`${process.cwd()}/package.json`, 'utf8')
const json = JSON.parse(packageFile)
const version = json.version

program
  .version(version)
  .option('-b, --build', 'Build example features')
  .option('-t, --test', 'Start test')
  .parse(process.argv)

if (program.build) {
  build()
}

if (program.test) {
  console.log('test')
}
