const { ServerError, BadRequest, NotFound } = require('../models/Errors');

const handleErrors = (err, req, res, next) => {
    if(err instanceof ServerError) {
      res.status(500)
      res.render('./pages/500', { message: 'Ошибка на стороне сервера', user: req.user ? req.user : false })
      return
    }
    if(err instanceof NotFound) {
      res.status(404)
      res.render('./pages/404', { message: 'Книга не найдена', user: req.user ? req.user : false })
      return
    }
    if(err instanceof BadRequest) {
      res.status(400)
      res.render('./pages/404', { message: 'Ошибка в запросе', user: req.user ? req.user : false })
      return
    } else {
      if(req.session.messages) res.render('./pages/login', { message: req.session.messages[0], user: req.user ? req.user : false })
    }
}


module.exports = handleErrors;