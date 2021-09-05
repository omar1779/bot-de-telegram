const dotenv = require('dotenv')
dotenv.config()
require('./database')
require('./tasks/deleteUser.js')