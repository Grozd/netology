const { Book, Comment } = require('../models')
/* const {HOST, PORT} = require('../config.json')
const url = new URL(`http://${HOST}${PORT}`) */
const url = new URL(`http://${process.env.HOST}${process.env.PORT}`)
const { BadRequest, ServerError } = require('../models/Errors')
const { getUser, renderView, getCounter, postDelCounter } = require('../functions')

module.exports = {
    get_AllBooks: async function(req, res, next) {
        try {
            let books = await Book.getAllBooks()
            res.status(200)
            res.json({ books })
            
        } catch (error) {
            next(new ServerError(error))
        }
    },
    get_BookById: async function(req, res) {
        if(req.matchBook) {
            res.status(200)
            res.json({ book: req.matchBook })
        } else {
            res.status(404)
            res.json({ note: 'Книга не найдена' })
        }
    },
    post_createBook: async function(req, res, next) {
        try {
            const newBook = await Book.createBook({...req.body})
            res.set('Content-Location', url + 'api/books' + `/${newBook.id}`)
            res.status(200)
            res.json({newBook})
        } catch (error) {
            next(new ServerError(error))
        }
    },
    create: async function(req, res, next) {
        try {
            // валидация на 'минимум' для создания книги
            if(!(req.body.title && req.body.authors)) {
                res.render('./pages/create', { data: { note: 'Вы не указали необходимые поля title и authors' }})
                return
            }
            if(await Book.getIdBookByTitleAndAuthors(req.body.title, req.body.authors)) {
                res.render('./pages/create', { data: { note: 'Такая книга уже существует' }})
            } else {
                let newBook
                let fileBook = req.files && req.files['fileBook'] ? req.files['fileBook'][0] : false
                let fileCover = req.files && req.files['fileCover'] !== undefined ? req.files['fileCover'][0] : false
                
                if(fileBook && fileBook.mimetype === 'text/plain') {
                    newBook = Book.createBook({...req.body, fileName: fileBook.originalname, fileBook: fileBook.path})
                } else {
                    // создание книги (без файлов обложки и содержимого)
                    newBook = await Book.createBook({...req.body})
                    // запрос на создание счетчика
                    const counter = await getCounter(newBook.id, next)
                    // удаляем книгу после неудачи соединения с другим сервисом и останавливаем скрипт
                    if(!Number.isInteger(counter)) {
                        await Book.removeById(newBook.id)
                        return
                    }
                }
                // если есть обложка
                if(fileCover && fileCover.mimetype.startsWith('image/')) {
                    setFileCover(id, fileCover.path)
                }
                if(newBook) {
                    res.set('Content-Location', url + 'create' + `/${newBook.id}`)
                    res.redirect('/')
                } else {
                    // когда будем создавать фаил книги пригодится. в идеале не создавать книгу без файла
                    next(new BadRequest('фаил книги не прикреплен'))
                }
            }
            } catch (error) {
                next(new ServerError(error))
            }
    },
    update: async function(req, res, next) {
        try {
            const fileBook = req.files && req.files['fileBook'] ? req.files['fileBook'][0] : false
            const fileCover = req.files && req.files['fileCover'] ? req.files['fileCover'][0] : false
    
            req.matchBook = await Book.updateBook(req.idBook, {
                ...req.body,
                fileName: fileBook ? fileBook.originalname : '',
                fileBook: fileBook ? fileBook.path : '',
                fileCover: fileCover ? fileCover.path : ''
            })
            renderView(req, res)
        } catch (error) {
            next(new ServerError(error))
        }
    },
    delete: async function(req, res, next) {
        try {
            await Book.removeById(req.idBook)
            await postDelCounter(req.idBook)
            await Comment.deletingAllCommentsFromBook(req.idBook)
            res.redirect('/')
        } catch (error) {
            next(new ServerError(error))
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
    get_pageIndex: async function(req, res, next) {
        try {
            let books = await Book.getAllBooks()
            let data = {
                books,
                user: getUser(req)
            }
            
            if(books.length === 0) data.note = 'Книг пока нет'

            if(books) {
                res.render('./pages/index', { data }, (err, html) => {
                    if(err) next(new ServerError(err))
                    res.status(200).end(html)
                })
            } else {
                next(new ServerError(error))
            }
        } catch (error) {
            next(new ServerError(error))
        }
    },
    get_pageCreate: function(req, res) {
        res.render('./pages/create', { data: { user: getUser(req) }})
    },
    get_pageView: async function(req, res, next) {
        try {
            renderView(req, res)
        } catch (error) {
            next(new ServerError(error))
        }
    },
    get_pageUpdate: function(req, res) {
        res.render('./pages/update', { data: { book: req.matchBook, user: getUser(req) }})
    }
}