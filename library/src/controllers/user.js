const { User } = require('../models')
var crypto = require('crypto');
//const url = new URL(`http://${process.env.HOST}${process.env.PORT}`)
const LocalStrategy = require('passport-local');
const passport = require('passport');
const { ServerError } = require('../models/Errors')

// установка стратегии - локальная
passport.use(new LocalStrategy(User.verify.bind(User)));
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  User.getById(id, (err, user) => {
    if (err) { return cb(err) }
    cb(null, user)
  })
})

module.exports = {
  // функция аутентификации не дает возможность вызвать res.redirect в callback из за отстутствия res.
  // приходится перехватывать ошибку и вызывать в обработчике handleErrors.js
    login: passport.authenticate('local', {
        successRedirect: '/',
        failureMessage: true,
        failWithError: true,
        badRequestMessage: 'Требуется указать пользователя и пароль'
    }),
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
          const user = await User.createUser({username: req.body.username, hashedPassword: hashedPassword.toString('hex'), salt: salt.toString('hex')})
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
        res.render('./pages/login', {message: '', user: req.user ? req.user : false})
    },
    get_pageProfile: function(req, res) {
      if(!req.isAuthenticated()) {
        res.redirect('/login')
      } else {
        res.render('./pages/profile', { message: '', user: req.user })
      }
    }
}