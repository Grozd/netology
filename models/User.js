const {v4: uuid } = require('uuid')
const storage = require('../storage')

class User {
    id = uuid()
    constructor(mail) {
        this.mail = mail
    }

    static createUser(mail) {
        let newUser = new User(mail)
        storage.books.push(newUser)
        return newUser.id
    }
}

module.exports = User