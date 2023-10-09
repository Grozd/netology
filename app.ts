
interface Book {
    _id: string         // задается автоматически mongoose
    title: string,
    description: string,
    authors: string,
    fileCover: string,
    fileName: string,
    fileBook: string
}

abstract class BooksRepository {
    abstract createBook() : BooksRepository | undefined
    abstract getBook(id: string) : BooksRepository | undefined
    abstract getBooks() : [BooksRepository] | []
    abstract updateBook(id: string) : Promise<BooksRepository>
    abstract deleteBook(id: string) : Promise<BooksRepository>
}

class Comix implements Book {
    _id: string
    title: string
    description: string
    authors: string
    fileCover: string
    fileName: string
    fileBook: string
    constructor (obj: Book) {
        this._id = obj._id
        this.title = obj.title
        this.description = obj.description
        this.authors = obj.authors
        this.fileCover = obj.fileCover
        this.fileName = obj.fileName
        this.fileBook = obj.fileBook
    }
}