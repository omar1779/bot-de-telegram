const mongoose = require('mongoose') 

const { DB_USER, DB_PASSWORD, DB_NAME } = process.env

const URI = `mongodb://${DB_USER}:${DB_PASSWORD}@cluster0-shard-00-00.og6lz.mongodb.net:27017,cluster0-shard-00-01.og6lz.mongodb.net:27017,cluster0-shard-00-02.og6lz.mongodb.net:27017/${DB_NAME}?ssl=true&replicaSet=atlas-13giey-shard-0&authSource=admin&retryWrites=true&w=majority`
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once('open', () => { 
    console.log('Connected succesfully to mongo')
    require('./chat/bot')
})
