const dotenv = require('dotenv')
import express from 'express'
dotenv.config()


const app = express()
app.listen(3000, function () {
    console.log(`http://localhost:${3000}`)
  })
require('./database')
require('./tasks/deleteUser.js')