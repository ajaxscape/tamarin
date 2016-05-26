'use strict'

const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(`${__dirname}/public`))

app.all('/*', function (req, res) {
  if (req.originalUrl.indexOf('.') !== -1) {
    // Assume catchall with a suffix are missing static files
    res.sendStatus(404)
  } else if (req.headers.accept && req.headers.accept.indexOf('html') !== -1) {
    // Assume all html routes return the index.html
    res.sendFile(path.resolve(`${__dirname}/index.html`))
  } else {
    res.sendStatus(404)
  }
})

const server = app.listen(3021, function () {
  const host = server.address().address
  const port = server.address().port
  console.log(`Example app listening at http://${host}:${port}`)
})
