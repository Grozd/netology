const { Schema, model } = require('mongoose')

const userSchema = new Schema({

})

userSchema.static({

});


module.exports = model('User', userSchema)