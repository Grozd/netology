const bookController = require('../controllers/book')
const errorController = require('../controllers/errors')
const router = require('express').Router()
const storage = require('../storage')
const upload = require('../middleware/upload')

function matchId(req, res, next) {
    const {id} = req.params
    req.id = id
    req.matchBook = storage.getBookById(id)
    next()
}

router.route(/^\/api\/books$/)
.get(bookController.read)
.post(
    upload.fields([{name: 'fileBook'}, {name: 'fileCover'}]),
    bookController.create
)

router.route('/api/books/:id')
.get(matchId, bookController.readByID)
.put(
    matchId,
    upload.fields([{name: 'fileBook'}, {name: 'fileCover'}]),
    bookController.update
)
.delete(matchId, bookController.delete)

router.get('/api/books/:id/download', matchId, bookController.download)

router.route('/api/books/*', errorController.error)


module.exports = router