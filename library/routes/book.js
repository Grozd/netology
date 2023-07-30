const bookController = require('../controllers/book')
const errorController = require('../controllers/errors')
const router = require('express').Router()
const { getById } = require('../DB/db')

const upload = require('../middleware/upload')

async function matchId(req, res, next) {
    const {id} = req.params
    req.id = id
    req.matchBook = await getById('books',id)
    next()
}

// переходы по страницам
router.get('/', bookController.get_pageIndex)
router.get('/create', bookController.get_pageCreate)
router.get('/update/:id', matchId, bookController.get_pageUpdate)
router.get('/view/:id', matchId, bookController.get_pageView)

//действия
router.post('/delete/:id', matchId, bookController.delete)
router.post('/update/:id', matchId, upload.fields([{name: 'fileBook'}, {name: 'fileCover'}]), bookController.update)
router.post('/create', upload.fields([{name: 'fileBook'}, {name: 'fileCover'}]), bookController.post_create)

router.put('/api/books/:id',
    matchId,
    upload.fields([{name: 'fileBook'}, {name: 'fileCover'}]),
    bookController.update
)

router.get('/api/books/:id/download', matchId, bookController.download)

router.all('*', errorController.error)


module.exports = router