const dotenv = require('dotenv')
import express from 'express'
dotenv.config()


const app = express()

const { PORT } = process.env
app.listen(PORT, function () {
    console.log(`http://localhost:${PORT}`)
  })
require('./database')
require('./tasks/deleteUser.js')