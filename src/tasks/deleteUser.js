import { StudentSchema } from '../models/index.js'
import TelegramSchema from '../models/telegram.js'
import cron from 'node-cron'
import banChatMember from '../chat/tools/banChatMember.js'
import sendMessage from '../chat/tools/sendMessage.js'
import moment from 'moment'
cron.schedule('* */12 * * *', () => {
  deleteUserFromChat()
});

export const banUserById = async (userID) => {
    const exist = await TelegramSchema.findOne({userID})
    if(!exist) {
      return
    }
    try {
      await banChatMember(exist.chatID)
      await sendMessage('Tu membresía ya expiró, vuelve a comprar otro mes en runningtrader.com para acceder al canal de señales, espera anmenos 2h antes de usar /unirme nuevamente', exist.chatID)
      await TelegramSchema.findOneAndDelete({userID})
    } catch(e) {
      await sendMessage(`Intente sacar al usuario ${userID} pero obtuve un error ${e}`)
      console.error(e)
    }
}
export const deleteUserFromChat = async () => {
      // traemos todos los usarios con fecha de vencimiento entre ayer y hoy
      const yesterday = moment().subtract(2, 'd')

      
      const mayBeDelete = await StudentSchema.find({
        expirationDate: {
          $gte: new Date(yesterday.toString()),
          $lt: new Date()
        }
  
      })
      // recorremos los usarios
      const students = await mayBeDelete.toArray()
      students.forEach(({userID}) => banUserById(userID))
}
deleteUserFromChat()