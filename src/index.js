const express = require('express')
const dotenv = require('dotenv')
const app = express()
dotenv.config()
require('./database')
const payments = require('./payments.js').default
app.use(express.json())

payments(app)

app.listen(3000, () => {
    console.log('App listening on port 3000!');
})