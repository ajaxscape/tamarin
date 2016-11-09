#!/usr/bin/env node

/**
 * Module dependencies.
 */

const fs = require('fs')
const exec = require('child_process').exec
const program = require('commander')

const packageFile = fs.readFileSync(`${process.cwd()}/package.json`, 'utf8')
const json = JSON.parse(packageFile)
const version = json.version

program
  .version(version)
  .option('-b, --build', 'Build example features')
  .option('-t, --test', 'Start test')
  .parse(process.argv)

if (program.build) {
  require('./build')()
}

if (program.test) {
  const command = `${process.cwd()}/node_modules/cucumber/bin/cucumber.js`
  console.log(command)
  exec(command).stdout.pipe(process.stdout)
}

if (!program.args.length) program.help()
