const { Book } = require('../models')
const { getIdBookByTitleAndAuthors, setFileCover, removeById, getAllBooks } = require('../DB/db')
const { HOST, PORT, COUNTER_URL } = require('../config.json')
const url = new URL(`http://${HOST}${PORT}`)

// запрос на создание счетчика для книги
async function getCounter(id) {
    let response = await fetch(`${COUNTER_URL}/counter/${id}`)
    .catch(err => console.log(err, 'запрос счетчику GET: провал'))
    response = await response.json()
    return response.data
}
// запрос на увеличение счетчика для книги
async function postIncrCounter(id) {
    let response = await fetch(`${COUNTER_URL}/counter/${id}/incr`, {
        method: 'POST'
    })
    .catch(err => console.log('запрос счетчику POST incr: провал ', err))
    response = await response.json()
    return response.data
}

// запрос на удаление счетчика для книги после удаления самой книги
async function postDelCounter(id) {
    fetch(`${COUNTER_URL}//counter/${id}/delete`, {
            method: 'POST'
    })
    .catch(err => console.log(err, 'запрос счетчику delete POST: провал'))
}

module.exports = {
    post_create: async function(req, res, next) {
        // валидация на минимум для создания книги
        if(!(req.body.title && req.body.authors)) {
            res.render('./pages/create', {message: 'Вы не указали необходимые поля title и authors'})
            return
        }
        if(await getIdBookByTitleAndAuthors(req.body.title, req.body.authors)) {
            res.render('./pages/create', {message: 'Такая книга уже существует'})
        } else {
            let id
            let fileBook = req.files && req.files['fileBook'] ? req.files['fileBook'][0] : false
            let fileCover = req.files && req.files['fileCover'] !== undefined ? req.files['fileCover'][0] : false
            
            if(fileBook && fileBook.mimetype === 'text/plain') {
                id = Book.createBook({...req.body, fileName: fileBook.originalname, fileBook: fileBook.path})
            } else {
                // создание книги (только название и автор)
                id = await Book.createBook({...req.body})
                getCounter(id)

            }
            // если есть обложка
            if(fileCover && fileCover.mimetype.startsWith('image/')) {
                setFileCover(id, fileCover.path)
            }
            if(id) {
                res.set('Content-Location', url + 'api/books' + `/${id}`)
                res.redirect('/')
            } else {
                // когда будем создавать фаил книги
                res.status(400).json({message: 'фаил книги не прикреплен'})
            }
        }
    },
    update: async function(req, res, next) {
        let fileBook = req.files && req.files['fileBook'] ? req.files['fileBook'][0] : false
        let fileCover = req.files && req.files['fileCover'] ? req.files['fileCover'][0] : false

        let updatedBook = Book.updateBook(req.id, {
            ...req.body,
            fileName: fileBook ? fileBook.originalname : '',
            fileBook: fileBook ? fileBook.path : '',
            fileCover: fileCover ? fileCover.path : ''
        })
        let counter = await getCounter(req.id)
        res.render('./pages/view', { book: updatedBook , counter: counter })

    },
    delete: function(req, res, next) {
        (async function(){
            await removeById('books',req.id)
            await postDelCounter(req.id)
            res.redirect('/')
        })()
    },
    download: function(req, res, next) {

        let nameFile = req.matchBook.fileBook.split('/')
        nameFile = nameFile[nameFile.length - 1]

        res.download(`./public/bookFiles/${nameFile}`, nameFile, err => {
            if(err) throw err
            res.status(500).end()
        })
    },
    get_pageIndex: function(req, res, next) {
        (async function(){
            res.render('./pages/index', { books: await getAllBooks() })
        })()
    },
    get_pageCreate: function(req, res, next) {
        res.render('./pages/create', {message: ''})
    },
    get_pageView: async function(req, res, next) {
        let counter = await postIncrCounter(req.id)
        if(req.matchBook) res.render('./pages/view', { book: req.matchBook, counter: counter })
        else res.render('./pages/404', {message: 'Такая книга не найдена'})
    },
    get_pageUpdate: function(req, res, next) {
        if(req.matchBook) {
            res.render('./pages/update', {book: req.matchBook}) 
        } else {
            res.render('./pages/404', {message: 'Такая книга не найдена'})
        }
    }
}