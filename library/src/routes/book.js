const bookController = require('../controllers/book')
const { NotFound, ServerError } = require('../models/Errors')
const router = require('express').Router()
const Book = require('../models/Book')
const upload = require('../middleware/upload')

async function matchId(req, res, next) {
    try {
        const {id} = req.params
        const arrFound = await Book.getById(id)
        if(arrFound.length > 0) {
            req.matchBook = arrFound[0]
            req.idBook = id
            next()
        } else {
            next(new NotFound('Книга не найдена'))
        }
    } catch (error) {
        next(new ServerError(error))
    }
}

// по прошлому заданию. Методы put и delete заменены на post с указанием через url
router.get('/api/books', bookController.get_AllBooks) // аналог get_pageIndex
router.get('/api/books/:id', matchId, bookController.get_BookById) // аналог get_pageView
router.post('/api/books', bookController.post_createBook) // аналог create


// переходы по страницам
router.get('/', bookController.get_pageIndex)
router.get('/create', bookController.get_pageCreate)
router.get('/update/:id', matchId, bookController.get_pageUpdate)
router.get('/view/:id', matchId, bookController.get_pageView)

//действия
router.post('/delete/:id', matchId, bookController.delete)
router.post('/update/:id', matchId, upload.fields([{name: 'fileBook'}, {name: 'fileCover'}]), bookController.update)
router.post('/create', upload.fields([{name: 'fileBook'}, {name: 'fileCover'}]), bookController.create)

router.get('/api/books/:id/download', matchId, bookController.download)
router.all('/*', (req, res, next)=>{
    next(new NotFound('Не корректный адрес'))
})


module.exports = router