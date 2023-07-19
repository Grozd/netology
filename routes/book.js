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

// переходы по страницам
router.get('/', bookController.get_pageIndex)
router.get('/create', bookController.get_pageCreate)
router.get('/update/:id', matchId, bookController.get_pageUpdate)

//действия
router.post(/^\/api\/books$/,
    upload.fields([{name: 'fileBook'}, {name: 'fileCover'}]),
    bookController.post_create
)

router.route('/api/books/:id')
.get(matchId, bookController.get_pageView)
.put(
    matchId,
    upload.fields([{name: 'fileBook'}, {name: 'fileCover'}]),
    bookController.update
)
.delete(matchId, bookController.delete)

router.get('/api/books/:id/download', matchId, bookController.download)

router.route('*', errorController.error)


module.exports = router