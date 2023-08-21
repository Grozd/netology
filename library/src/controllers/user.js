const { User } = require('../models')
const url = new URL(`http://${process.env.HOST}${process.env.PORT}`)

module.exports = {
    create: async function(req, res, next) {
        let id = null
        if(req.body.mail) {
            id = await User.createUser(req.body.mail)
            res.set('Content-Location', url + 'api/user/login' + `/${id}`)
            //ответ по условию задачи
            res.status(201).json({ id: 1, mail: "test@mail.ru" })
        } else {
            res.status(400).json({ message: "Не указана почта" })
        }
    },
    read: function(req, res, next) {
        next()
    }
}