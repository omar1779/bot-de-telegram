import { bot } from './index.js'
import moment from 'moment'
import { v1 } from 'id-creator'
import axios from 'axios'
import TelegramSchema from '../models/telegram.js'
import { StudentSchema, VideoSchema } from '../models/index.js'
import { banUserById } from '../tasks/deleteUser.js'
// unirse al canal

bot.command('unirme', async (ctx) => {
  const { id, username, is_bot: isBot } = ctx.from
  const { text, chat: { type } } = ctx.message
  // si es chat privado
  if (type === 'private' && !isBot) {
    // parsamos los datos
    const params = text.split(' ', 3)
    if (!params[1] && !params[2]) {
      return bot.telegram.sendMessage(ctx.chat.id, 'Usuario o token invalido')
    }
    // buscamos el usuario y verificamos si tiene un token valido
    const result = await StudentSchema.findOne({ userID: params[1] })
    if (!result) {
      return bot.telegram.sendMessage(ctx.chat.id, 'Usuario o token no valido')
    }
    const { telegram: { telegramToken } } = result
    if ('' + telegramToken !== params[2]) {
      return bot.telegram.sendMessage(ctx.chat.id, 'Usuario o token no valido')
    }
    // si hay token le damos accesso y generamos el link
    const expireDate = moment().add(7, 'days').unix()
    const { invite_link: inviteLink } = await bot.telegram.createChatInviteLink(process.env.CHANEL_ID, expireDate, 1)
    // guardamos el ek JSON
    const telegramUser = new TelegramSchema({ userID: params[1], chatID: id, telegramUser: username })
    telegramUser.save()
    // borramos el token
    await StudentSchema.findOneAndUpdate({ userID: params[1] }, {  $set: {'telegram.telegramToken': null} })
    return bot.telegram.sendMessage(ctx.chat.id, `Bienvenido a Running trader, aqui esta tu link para entrar ${inviteLink}`)
  }
})
// borrar video
bot.command('borrar', async (ctx) => {
  const { id } = ctx.from
  const { text } = ctx.message
  if (id + '' === process.env.ADMIN_ID) {
    const params = text.split(' ', 2)
    await VideoSchema.findOneAndDelete({ key: params[1] })
    return bot.telegram.sendMessage(ctx.chat.id, 'Borrado exitosamente')
  }
  return bot.telegram.sendMessage(ctx.chat.id, 'Comando no valido')
})
// dar accesso manualmente
bot.command('manual', async (ctx) => {
  const { id } = ctx.from
  const { text } = ctx.message
  if (id + '' === process.env.ADMIN_ID) {
    const params = text.split(' ', 4)
    if (!params[1] && params[2]) {
      return bot.telegram.sendMessage(ctx.chat.id, 'Formato invalido')
    }
    // buscamos el usuario
    const endDate = moment().add(params[2], 'd')
    console.log(endDate._d )
    const transacctionID = v1(8, false)
    const description = params[2] > 0 ? 'Acceso manual a la academia de Runnig trader' : 'Bloqueo de acceso a la academia de Runnig trader'
    const result = await StudentSchema.findOneAndUpdate({ userID: params[1] }, {
      $addToSet: {
        transactions: { endDate, amount: !params[3] ? 0 : parseInt(params[3]), description, status: 'completado', transacctionID, transacctionType: 'Manual' }
      },
      $set: { expirationDate: endDate._d }
    })
    if (!result) {
      return bot.telegram.sendMessage(ctx.chat.id, 'Usuario no encontrado')
    }
    if (params[2] > 0) {
      const token = v1(4, false)
      await StudentSchema.findOneAndUpdate({ userID: params[1] }, { $set: { telegram: { telegramToken: token }}})
    }
    return bot.telegram.sendMessage(ctx.chat.id, `Usuario ${params[1]} añadido hasta ${endDate.format('L')}`)
  }
  return bot.telegram.sendMessage(ctx.chat.id, 'Comando no valido')
})

// actualizar carpeta
bot.command('borrar', async (ctx) => {
  const { id } = ctx.from
  const { text } = ctx.message
  if (id + '' === process.env.ADMIN_ID) {
    const params = text.split(' ', 2)
    await VideoSchema.findOneAndDelete({ key: params[1] })
    return bot.telegram.sendMessage(ctx.chat.id, 'Borrado exitosamente')
  }
  return bot.telegram.sendMessage(ctx.chat.id, 'Comando no valido')
})

const teacherID = [4700303, 5031269, 5031278, 4700317, 4700314, 5031533, 5121340, 5121342, 5246218]
bot.command('actualizar', async (ctx) => {
  const { id } = ctx.from
  const { text } = ctx.message
  if (id + '' === process.env.ADMIN_ID) {
    const params = text.split(' ', 2)
    if (!params[1]) {
      return bot.telegram.sendMessage(ctx.chat.id, 'Formato no valido')
    }
    // obtenemos la carpeta de vimeo
    const data = await axios({
      method: 'GET',
      url: `https://api.vimeo.com/users/${process.env.VIMEO_ID}/projects/${teacherID[params[1]]}/videos`,
      headers: {
        'Content-type': 'application/json',
        Authorization: `Bearer ${process.env.VIMEO_TOKEN}`
      }
    })
    // sacamos la lista de los videos
    const { data: preVideos } = data.data
    const videos = preVideos.reverse()
    // por cada video lo guardas
    videos.forEach(async (video, order) => {
      const { uri, name: preName, duration: videDuration, description = '', parent_folder: parentFolder } = video
      // creamos las variables que guardaremos
      // key del video
      const uriString = uri.match(/(\d+)/g)
      const key = parseFloat(uriString[0])
      // quitamos el .mp4
      const name = preName.toLowerCase()
      const PreTitle = name.endsWith('.mp4') ? name.substring(0, name.length - 4) : name
      // ponemos las primeras letras en mayuscula
      const title = PreTitle.replace(/\b\w/g, l => l.toUpperCase())
      // redondeamos la duracion total
      const duration = Math.floor(videDuration / 60)
      // la carpeta es el ID del profesor
      const profesorID = parentFolder.name
      // si hay un error ya existe, entonces actualizamos
      const exist = await VideoSchema.findOne({ key })
      if (exist) {
        await VideoSchema.findOneAndUpdate({ key },{ $set: { title, description, profesor_id: profesorID, order }})
      } else {
        const newVideo = new VideoSchema({
          title,
          description,
          key,
          duration,
          profesor_id: profesorID,
          order
        })
        await newVideo.save()
      }
    })
    return bot.telegram.sendMessage(ctx.chat.id, 'Actualizado exitosamente')
  }
})


bot.command('banear', async (ctx) => {
  const { id } = ctx.from
  const { text } = ctx.message
  if (id + '' === process.env.ADMIN_ID) {
    const params = text.split(' ', 2)
    await banUserById(params[1])
    return bot.telegram.sendMessage(ctx.chat.id, 'baneado exitosamente')
  }
  return bot.telegram.sendMessage(ctx.chat.id, 'Comando no valido')
})

bot.launch()
console.log('bot running')