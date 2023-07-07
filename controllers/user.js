const { User } = require('../models')
const { host, port } = require('../config.json')
const url = new URL(`http://${host}${port}`)

module.exports = {
    create: function(req, res, next) {
        let id = null
        if(req.body.mail) {
            id = User.createUser(req.body.mail)
            res.set('Content-Location', url + 'api/user/login' + `/${id}`)
            //ответ по условию задачи
            res.status(201).json({ id: 1, mail: "test@mail.ru" })
        } else {
            res.status(400).json({ message: "Не указана почта" })
        }
    },
    read: function(req, res, next) {

    }
}