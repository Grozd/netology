const {v4: uuid } = require('uuid')
const storage = require('../storage')

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
        let newBook = new Book(obj)
        storage.books.push(newBook)
        return newBook.id
    }

    static updateBook(id, obj) {
        let newBook = new Book(obj)
        storage.setBookById(id, newBook)
        return newBook.id
    }
}

module.exports = Book