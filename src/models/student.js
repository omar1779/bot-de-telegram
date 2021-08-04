const mongoose = require('mongoose') 
const moment = require('moment') 
const studentSchema = new mongoose.Schema({
  expirationDate: {
    type: Date,
    required: true
  },
  userID: {
    type: String,
    unique: true
  },

  userName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },
  referredTree: {
    upline: {
      type: String,
      required: true
    },
    downline: [{
      userID: String,
      updated: {
        type: Date,
        default: moment()
      }
    }]
  },
  password: {
    type: String,
    required: true
  },
  telegram: {
    telegramToken: Number,
    telegramID: Number,
    telegramLink: String
  },
  transactions: [{
    startDate: {
      type: Date,
      default: moment().format('l')
    },
    endDate: {
      type: Date
    },
    amount: {
      type: Number,
      required: true
    },
    transacctionID: {
      type: String,
      unique: true
    },
    description: String,
    status: {
      type: String,
      enum: ['completado', 'pendiente', 'fallido'],
      required: true,
      default: 'completado'
    }
  }]
}, { Timestamp: true })
exports.default = mongoose.model('students', studentSchema)
