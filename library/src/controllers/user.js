var crypto = require('crypto');
const { User, Role } = require('../models')
const { ServerError } = require('../models/Errors')
const { getUser } = require('../functions')
const { passportLogin } = require('../middleware/passport')

module.exports = {
  // функция аутентификации не дает возможность вызвать res.redirect в callback из за отстутствия res.
  // приходится перехватывать ошибку и вызывать в обработчике handleErrors.js
    login: passportLogin,
    logout: function(req, res) {
      req.logout(function(){
      })
      res.redirect('/')
    },
    signup: async function(req, res, next) {
      try {
        let salt = crypto.randomBytes(16);
        crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
          if (err) { return next(err); }
          // при успешной регистрации назначаем пользователю роль
          let roleUser
          if(req.body.username === 'admin') {
            roleUser = await Role.findOne({name: 'admin'})
          } else {
            roleUser = await Role.findOne({name: 'user'})
          }
          const user = await User.createUser({
            username: req.body.username,
            hashedPassword: hashedPassword.toString('hex'),
            salt: salt.toString('hex'),
            roles: [roleUser.name]
          })
          // авто аутентификация после регистрации
          req.login(user, function(err) {
            if (err) { return next(err); }
            res.redirect('/');
          });
          
        });
      } catch (error) {
        next(new ServerError(error))
      }
    },
    get_pageLogin: function(req, res) {
        res.render('./pages/login', { data: { note: '', user: getUser(req) }})
    },
    get_pageProfile: function(req, res) {
      if(!req.isAuthenticated()) {
        res.redirect('/login')
      } else {
        res.render('./pages/profile', { data: { note: '', user: getUser(req) }})
      }
    }
}