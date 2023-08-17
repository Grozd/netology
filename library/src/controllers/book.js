const Book = require('../models/Book')
const { HOST, PORT, COUNTER_URL } = require('../config.json')
const url = new URL(`http://${HOST}${PORT}`)
const { BadRequest, ServerError } = require('../models/Errors')

// запрос на создание счетчика для книги
async function getCounter(id, next) {
    try {
        let response = await fetch(`${COUNTER_URL}/counter/${id}`)
        response = await response.json()
        return response.data
    } catch (error) {
        next(new ServerError('Ошибка на стороне сервера. Нет соединения с одним из сервисов'))
    }
}
// запрос на увеличение счетчика для книги
async function postIncrCounter(id) {
    try {
        let response = await fetch(`${COUNTER_URL}/counter/${id}/incr`, {
            method: 'POST'
        })
        response = await response.json()
        return response.data
    } catch (error) {
        next(new ServerError('Ошибка на стороне сервера. Нет соединения с одним из сервисов'))
    }
}
// запрос на удаление счетчика для книги после удаления самой книги
async function postDelCounter(id) {
    try {
        fetch(`${COUNTER_URL}//counter/${id}/delete`, {
            method: 'POST'
    })
    } catch (error) {
        next(new ServerError('Ошибка на стороне сервера. Нет соединения с одним из сервисов'))
    }
}

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
            res.json({ message: 'Книга не найдена' })
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
                res.render('./pages/create', {message: 'Вы не указали необходимые поля title и authors'})
                return
            }
            if(await Book.getIdBookByTitleAndAuthors(req.body.title, req.body.authors)) {
                res.render('./pages/create', {message: 'Такая книга уже существует'})
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
                    res.set('Content-Location', url + 'api/books' + `/${newBook.id}`)
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
            let fileBook = req.files && req.files['fileBook'] ? req.files['fileBook'][0] : false
            let fileCover = req.files && req.files['fileCover'] ? req.files['fileCover'][0] : false
    
            let updatedBook = await Book.updateBook(req.id, {
                ...req.body,
                fileName: fileBook ? fileBook.originalname : '',
                fileBook: fileBook ? fileBook.path : '',
                fileCover: fileCover ? fileCover.path : ''
            })
            let counter = await getCounter(req.id)
            res.render('./pages/view', { book: updatedBook , counter: counter })
        } catch (error) {
            next(new ServerError(error))
        }
    },
    delete: async function(req, res, next) {
        try {
            await Book.removeById(req.id)
            await postDelCounter(req.id)
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
            if(books) {
                res.render('./pages/index', { books: books }, (err, html) => {
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
        res.render('./pages/create', {message: ''})
    },
    get_pageView: async function(req, res, next) {
        try {
            let counter = await postIncrCounter(req.id)
            res.render('./pages/view', { book: req.matchBook, counter })
        } catch (error) {
            next(new ServerError(error))
        }
    },
    get_pageUpdate: function(req, res) {
        res.render('./pages/update', {book: req.matchBook})
    }
}