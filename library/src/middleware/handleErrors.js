const { ServerError, BadRequest, NotFound } = require('../models/Errors');
const { getUser } = require('../functions')

const handleErrors = (err, req, res, next) => {
    if(err instanceof ServerError) {
      res.status(500)
      res.render('./pages/500', { data: {note: 'Ошибка на стороне сервера', user: getUser(req) }})
      return
    }
    if(err instanceof NotFound) {
      res.status(404)
      res.render('./pages/404', { data: {note: 'Книга не найдена', user: getUser(req) }})
      return
    }
    if(err instanceof BadRequest) {
      res.status(400)
      res.render('./pages/404', { data: {note: 'Ошибка в запросе', user: getUser(req) }})
      return
    } else {
      if(req.session.messages) {
        res.render('./pages/login', { data: {note: req.session.messages[0], user: getUser(req) }})
        return        
      }
      next(err)
    }
}


module.exports = handleErrors;