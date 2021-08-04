const axios = require('axios')
const sendMessage = async (text, chat_id = process.env.ADMIN_ID) => {
  try {
    await axios({
      method: 'POST',
      url: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      data: { chat_id, text }
    })
  } catch (e) {
    console.log(e)
    return e
  }
}
exports.default = sendMessage
