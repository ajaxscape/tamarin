#!/usr/bin/env node

const fs = require('fs')
const _ = require('lodash')

const structure = {
  features: {
    support: {
      driver: 'my driver',
      env: 'my env',
      hook: 'my hook',
      world: 'my world'
    },
    step_definitions: {
      example_steps: ''
    },
    example_feature: ''
  }
}

function generate (dir, node) {
  const keys = Object.keys(node)
  console.log(keys)
  keys.each((id) => {
    console.log(`Processing: ${id}`)
    if (_.isString(node[id])) {
      const filename = `${dir}/${id}.js`
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
