const { ServerError, BadRequest, NotFound } = require('../models/Errors');

const handleErrors = (err, req, res, next) => {
    if(err instanceof ServerError) {
      res.status(500)
      res.render('./pages/500', { message: 'Ошибка на стороне сервера' })
      return
    }
    if(err instanceof NotFound) {
      res.status(404)
      res.render('./pages/404', { message: 'Книга не найдена' })
      return
    }
    if(err instanceof BadRequest) {
      res.status(400)
      res.render('./pages/404', { message: 'Ошибка в запросе' })
      return
    }
    next(err)
}


module.exports = handleErrors;