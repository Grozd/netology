const { Schema, model } = require('mongoose')

const userSchema = new Schema()
    

userSchema.static({
    createUser: function(){}
});


module.exports = model('User', userSchema)