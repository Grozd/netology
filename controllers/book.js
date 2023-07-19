const { Book } = require('../models')
const storage = require('../storage')
const { host, port } = require('../config.json')
const url = new URL(`http://${host}${port}`)

function callback(res, err, html) {
    if(err) throw err
    res.status(200)
    res.send(html)
}

module.exports = {
    post_create: function(req, res, next) {
        // валидация на минимум для создания книги
        if(!(req.body.title && req.body.authors)) {
            res.status(400).json({message: 'Вы не указали необходимые поля title и authors'})
            return
        }

        if(storage.getIdBookByTitleAndAuthors(req.body.title, req.body.authors)) {
            res.status(404).json({message: 'Такая книга уже существует'})

        } else {
            
            let id
            let fileBook = req.files && req.files['fileBook'] ? req.files['fileBook'][0] : false
            let fileCover = req.files && req.files['fileCover'] !== undefined ? req.files['fileCover'][0] : false
            
            if(fileBook && fileBook.mimetype === 'text/plain') {
                id = Book.createBook({...req.body, fileName: fileBook.originalname, fileBook: fileBook.path})
            } else {
                // создание книги (только название и автор)
                id = Book.createBook({...req.body})
            }
            // если есть обложка
            if(fileCover && fileCover.mimetype.startsWith('image/')) {
                storage.setFileCover(id, fileCover.path)
            }
            if(id) {
                res.set('Content-Location', url + 'api/books' + `/${id}`)
                res.status(201).json({redirect: '/'})
            } else {
                res.status(400).json({message: 'фаил книги не прикреплен'})
            }
        }
    },
    update: function(req, res, next) {
        let fileBook = req.files && req.files['fileBook'] ? req.files['fileBook'][0] : false
        let fileCover = req.files && req.files['fileCover'] ? req.files['fileCover'][0] : false

        if(req.matchBook) {
            let idUpdateBook = Book.updateBook(req.id, {
                ...req.body,
                fileName: fileBook.originalname,
                fileBook: fileBook.path,
                fileCover: fileCover.path
            })
            res.set('Content-Location', url + 'api/books' + `/${idUpdateBook}`)
            // redirect не подходит, клиент(fetch) ждет json
            res.status(201).json({redirect: `/api/books/${idUpdateBook}`})
        } else {
            res.status(404).json({message: 'Такая книга не найдена'})
        }
    },
    delete: function(req, res, next) {
        if(req.matchBook) {
            const deleted = storage.deleteBook(req.id) //bool
            res.status(201).json({deleted: deleted})
        } else {
            res.status(404).json({message: 'Такая книга не найдена'})
        }
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
        let allBooks = storage.getAllBooks()
        res.render('./pages/index', { books: allBooks.length === 0
                ? {message: 'Книг пока нет'}
                : {payload: allBooks}
        }, callback.bind(null, res))
    },
    get_pageCreate: function(req, res, next) {
        res.render('./pages/create', callback.bind(null, res))
    },
    get_pageView: function(req, res, next) {
        if(req.matchBook) res.render('./pages/view', {book: req.matchBook})
        else res.render('./pages/404', {message: 'Такая книга не найдена'})
    },
    get_pageUpdate: function(req, res, next) {
        if(req.matchBook) {
            res.render('./pages/update', {book: req.matchBook}, callback.bind(null, res)) 
        } else {
            res.status(404).json({message: 'Такая книга не найдена'})
        }
    }
}