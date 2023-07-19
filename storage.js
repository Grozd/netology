
function Storage() {
    this.users = []
    this.books = []
}
// по книгам
Storage.prototype.getAllBooks = function() {
    return this.books
}
Storage.prototype.getBookById = function(id) {
    let f = this.books.find(book => book.id === id)
    return f
}
Storage.prototype.setBookById = function(id, newBook) {
    let foundIndex = this.findIndexById(id)
    this.books[foundIndex] = newBook
    return true
}
Storage.prototype.deleteBook = function(id) {
    let foundIndex = this.findIndexById(id)
    this.books.splice(foundIndex, 1)
    return true
}
Storage.prototype.findIndexById = function(id) {
    return this.books.findIndex(book => book.id === id)
}
Storage.prototype.getIdBookByTitleAndAuthors = function(title, authors) {
    let found = this.books.find(book => (book.title === title && book.authors === authors))
    if(found) return found.id
    else return false
}
Storage.prototype.setFileCover = function(id, path) {
    let foundBook = this.findIndexById(id)
    this.books[foundBook].fileCover = path
    return true
}
// по пользователям
Storage.prototype.getAllUsers = function() {
    return this.users
}
Storage.prototype.getUserById = function(id) {
    return this.users.find(user => user.id === id)
}
// по содержанию
Storage.prototype.getContent = function(key) {
    return this.content[key]
}


module.exports = new Storage()
