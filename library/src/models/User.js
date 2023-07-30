const {v4: uuid } = require('uuid')
const { add, setById } = require('../DB/db')

class User {
    id = uuid()
    constructor(mail) {
        this.mail = mail
    }

    static createUser(mail) {
        let newUser = new User(mail)
        add('users', newUser)
        return newUser.id
    }
}

module.exports = User