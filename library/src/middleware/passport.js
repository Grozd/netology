const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const LocalStrategy = require('passport-local');
const { User } = require('../models')

// установка локальной стратегии, которой передается наша функция проверки пароля и пользователя
passport.use(new LocalStrategy(User.verify.bind(User)));
// передача id пользователя из базы для сравнения с cookie
passport.serializeUser((user, cb) => {
    cb(null, user.id)
})

// получение пользователя из базы по id из cookie
passport.deserializeUser(async (id, cb) => {
    try {
      let foundUser = await User.getById(id)
      if(foundUser instanceof Error) {
        cb(foundUser)
      } else {
        cb(null, foundUser)
      }
    } catch (err) {
      cb(err)
    }
})

// получение middleware и дополнение req методами
const passportLogin = passport.authenticate('local', {
    failureMessage: true,
    failWithError: true
})
// получение middleware
const passport_Sess = passport.session()

// функция для связи с пакетом connect-mongo
function forSaveSessionInDB(clientDB) {
  // получение middleware
  const express_Sess = session({
    secret: 'hello',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
      client: clientDB
    }),
    cookie: {
        maxAge: 120000
    }
  })
  return express_Sess
}

module.exports = {
  forSaveSessionInDB,
  passportLogin,
  passport_Sess
 }