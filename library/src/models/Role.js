const { Schema, model } = require('mongoose')

const roleSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        default: 'guest'
    }
})

module.exports = model('Role', roleSchema)