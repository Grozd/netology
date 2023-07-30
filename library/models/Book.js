const {v4: uuid } = require('uuid')
const { add, setById } = require('../DB/db')

class Book {
    id = uuid()
    constructor({
        title,
        description = '',
        authors,
        favorite = '',
        fileCover = '',
        fileName = '',
        fileBook = ''
    }) {
        this.title = title
        this.description = description
        this.authors = authors
        this.favorite = favorite
        this.fileCover = fileCover
        this.fileName = fileName
        this.fileBook = fileBook
    }

    static createBook(obj) {
        let newBook = Object.freeze(new Book(obj))
        add('books', newBook)
        return newBook.id
    }

    static updateBook(id, obj) {
        let newBook = new Book(obj)
        newBook.id = id
        setById('books', id, newBook)
        return newBook
    }
}

module.exports = Book