const { Schema, model, isValidObjectId } = require('mongoose')
const crypto = require('crypto');

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    displayName: String,
    email: {
        type: String
    },
    hashedPassword: {
      type: String,
      required: true
    },
    salt: {
      type: String,
      required: true
    },
    roles: [{ type: String, ref: 'Role'}]
})


userSchema.static({
    verify: async function(username, password, cb) {
      try {
        let arrFound = await this.find({username: username})
        if(arrFound.length === 0) {
          return cb(null, false, { message: 'Такой пользователь не зарегистрирован' })
        }
        crypto.pbkdf2(password, Buffer.from(arrFound[0].salt, 'hex'), 310000, 32, 'sha256', function(err, hashedPassword) {
          if (err) { return cb(err); }
          if (!crypto.timingSafeEqual(Buffer.from(arrFound[0].hashedPassword, 'hex'), hashedPassword)) {
            return cb(null, false, { message: 'Не корректное имя или пароль' });
          }
          return cb(null, arrFound[0])
        });
      } catch (error) {
        return cb(error)
      }
    },
    getById: async function(id) {
      try {
          if(isValidObjectId(id)) {
              let arrFound = await this.find({"_id":id}).select('-__v')
              return arrFound[0]
          }
          // если недопустимое id
          return new Error('недопустимое id')
      } catch (error) {
        throw error
      }
    },
    createUser: async function(obj) {
      try {
        let newUser = new this({ ...obj })
        if(newUser) {
            return await newUser.save()
        } else return false
      }
      catch (error) {
        throw error
      }
    },
    deleteUser: async function(id) {
      try {
        await this.findByIdAndDelete(id)
      } catch (error) {
        throw error
      }
    }
})
    
module.exports = model('User', userSchema)