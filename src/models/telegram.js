import mongoose from 'mongoose'

const telegramSchema = new mongoose.Schema({
  userID: String,
  chatID: String,
  telegramUser: String
})

export default mongoose.model('telegram', telegramSchema)
