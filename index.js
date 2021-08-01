const express = require('express')
const dotenv = require('dotenv')

const app = express()
dotenv.config()
const env = process.env.TEST
app.get('/', (req, res) => {
    res.status(200).json({env})
})

app.listen(3000, () => {
    console.log('App listening on port 3000!');
})