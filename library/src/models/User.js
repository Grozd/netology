const {v4: uuid } = require('uuid')
const { add } = require('../DB/db')

class User {
    id = uuid()
    constructor(mail) {
        this.mail = mail
    }

    static async createUser(mail) {
        let newUser = new User(mail)
        await add('users', newUser)
        return newUser.id
    }
}

module.exports = User