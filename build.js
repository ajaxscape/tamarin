#!/usr/bin/env node

const fs = require('fs')
const _ = require('lodash')

const structure = {
  features: {
    support: {
      'driver.js': 'my driver',
      'env.js': 'my env',
      'hook.js': 'my hook',
      'world.js': 'my world'
    },
    step_definitions: {
      'example_steps.js': 'example steps'
    },
    'example.feature': 'example feature'
  }
}

function generate (dir, node) {
  const keys = Object.keys(node)
  keys.forEach((id) => {
    console.log(`Processing: ${id}`)
    if (_.isString(node[id])) {
      const filename = `${dir}/${id}`
      console.log(`saving ${filename}`)
      fs.writeFileSync(filename, node[id])
    } else {
      dir += `/${id}`
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
      }
      generate(dir, node[id])
    }
  })
}

generate(process.cwd(), structure)
