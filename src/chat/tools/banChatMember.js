const axios = require('axios')
import moment from 'moment'
const banChatMember = async (userID, chat_id = process.env.CHANEL_ID) => {
    const until = moment().add(1, 'h')
  try {
    await axios({
      method: 'POST',
      url: `https://api.telegram.org/bot${process.env.BOT_TOKEN}/banChatMember`,
      data: { chat_id, user_id: userID, until_date: until }
    })
  } catch (e) {
    console.log(e)
    return e
  }
}
export default banChatMember
