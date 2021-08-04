const StudentSchema = require('./models/student.js')
const { v1 } =  require('id-creator')
const sendMessage = require('./chat/sendMessage.js')
const moment = require('moment')

const payments = app => {
    app.post('/payments', async(req, res) => {
        const {email, amount} = req.body
        const token = v1(12, true)
        try {
            let endDate
            switch (amount) {
              case '140.00':
                endDate = moment().add(30, 'd')
                break
      
              case '700.00':
                endDate = moment().add(180, 'd')
                break
              case '1400.00':
                endDate = moment().add(365, 'd')
                break
              default:
                throw new Error('El plan no es valido')
            }

            const {telegram: telegramToken} = await StudentSchema.findOneAndUpdate({ email }, {
                $addToSet: {
                  transactions: { endDate, amount, description: `Pago de ${email}`, status: 'completado', transacctionID: token }
                },
                expirationDate: endDate
              })
              await sendMessage(`Hice un pago manual al ${email}`)

            // activamos su telegram si es nesesario
            if (!telegramToken) {
            const telegramToken = v1(4, false)
            await StudentSchema.findOneAndUpdate({ email }, { telegram: { telegramToken } })
          }
        } catch (e) {
            console.error(e)
            res.sendStatus(400)
        }
    })
}
exports.default = payments