const { Book } = require('../models')
const storage = require('../storage')
const { host, port } = require('../config.json')
const url = new URL(`http://${host}${port}`)

module.exports = {
    create: function(req, res, next) {
        
        // валидация
        if(!(req.body.title && req.body.authors)) {
            res.status(400).json({message: 'Вы не указали необходимые поля title и authors'})
            return
        }

        if(storage.getIdBookByTitleAndAuthors(req.body.title, req.body.authors)) {
            res.status(404).json({message: 'Такая книга уже существует'})
        } else {

            let id
            let fileBook = req.files['fileBook'] ? req.files['fileBook'][0] : false
            let fileCover = req.files['fileCover'] ? req.files['fileCover'][0] : false
            
            if(fileCover && fileBook === false) {
                res.status(400).json({message: 'Вы передали вместо книги, только обложку'})
                res.end()
                return
            }
            if(fileBook && fileBook.mimetype === 'text/plain') {
                id = Book.createBook({...req.body, fileName: fileBook.originalname, fileBook: fileBook.path})
            }
            if(fileCover && fileCover.mimetype.startsWith('image/')) {
                storage.setFileCover(id, fileCover.path)
            }
            if(id) {
                res.set('Content-Location', url + 'api/books' + `/${id}`)
                res.status(201).json(storage.getBookById(id))
            } else {
                res.status(400).json({message: 'фаил книги не прикреплен'})
                res.end()
            }
    
        }
    },
    read: function(req, res, next) {

        let allBooks = storage.getAllBooks()
        if(allBooks.length === 0) {
            res.status(200).json({message: 'Пока книг нет'})
        } else
        res.status(200).json(Object.entries(allBooks))
    },
    readByID: function(req, res, next) {

        if(req.matchBook) res.status(200).json(req.matchBook)
        else res.status(404).json({message: 'Такая книга не найдена'})
    },
    update: function(req, res, next) {

        let fileBook = req.files['fileBook'] ? req.files['fileBook'][0] : false
        let fileCover = req.files['fileCover'] ? req.files['fileCover'][0] : false

        if(req.matchBook) {
            let idUpdateBook = Book.updateBook(req.id, {
                ...req.body,
                fileName: fileBook.originalname,
                fileBook: fileBook.path,
                fileCover: fileCover.path
            })
            res.set('Content-Location', url + 'api/books' + `/${idUpdateBook}`)
            res.status(200).end()
        } else {
            res.status(404).json({message: 'Такая книга не найдена'})
        }
    },
    delete: function(req, res, next) {

        if(req.matchBook) {
            storage.deleteBook(req.id)
            res.status(200).json({message: 'ок'})
        } else {
            res.status(404).json({message: 'Такая книга не найдена'})
        }
    },
    download: function(req, res, next) {

        let nameFile = req.matchBook.fileBook.split('/')
        nameFile = nameFile[nameFile.length - 1]

        res.download(`./bookFiles/${nameFile}`, nameFile, err => {
            if(err) throw err
            res.status(500).end()
        })
    }
}