const {v4: uuid } = require('uuid')
const express = require('express')
const app = express()
const url = new URL('http://localhost')
url.port = 3000

class Book {
    id = uuid()
    constructor({
        title,
        description = '',
        authors,
        favorite = '',
        fileCover = '',
        fileName = ''
    }) {
        this.title = title
        this.description = description
        this.authors = authors
        this.favorite = favorite
        this.fileCover = fileCover
        this.fileName = fileName
    }
}

class User {
    constructor(mail, id) {
        this.id = id
        this.mail = mail
    }
}

const storage = {
    users: [],
    books: []
}

// добавлена одна книга для примера
const book = new Book({
    title: '12 стульев',
    description: 'В основе сюжета — поиски бриллиантов, спрятанных в одном из двенадцати стульев',
    authors: 'Ильф и Петров',
    favorite: '',
    fileCover: '',
    fileName: ''
})
storage.books.push(book);

app.use(express.json())

app.get('/api/books', (req, res) => {
    res.status(200).json(Object.entries(storage.books))
})
app.get('/api/books/:id', matchIndex, (req, res) => {
    if(req.matchIndex !== -1) res.status(200).json(storage.books[req.matchIndex])
    else res.status(404).json({message: 'Такая книга не найдена'}) 
})
app.post('/api/user/login', (req, res)=>{
    let newUser = null
    if(req.body.mail) {
        newUser = new User(req.body.mail, storage.users.length + 1)
        storage.users.push(newUser)
    }
    res.set('Content-Location', url + 'api/user/login' + `/${newUser.id}`)
    res.status(201).json({ id: 1, mail: "test@mail.ru" })
})
app.post('/api/books', (req, res) => {
    if(!(req.body.title && req.body.authors)) {
        res.status(404).json({message: 'Вы не указали необходимые поля title и authors'})
        return
    }
    if(storage.books.find(e => {
        return ((e.title === req.body.title) && (e.authors === req.body.authors))
    })) {
        res.status(404).json({message: 'Такая книга уже существует'})
    } else {
        let newBook = new Book(req.body)
        storage.books.push(newBook)
        res.status(201).json(newBook)
    }
})
app.put('/api/books/:id', matchIndex, (req, res) => {
    if(req.matchIndex !== -1) {
        storage.books[req.matchIndex] = new Book(req.body)
        res.set('Content-Location', url + 'api/books' + `/${storage.books[req.matchIndex].id}`)
        res.status(201)
    } else {
        res.status(404).json({message: 'Такая книга не найдена'})
    }
})
app.delete('/api/books/:id', matchIndex, (req, res) => {
    if(req.matchIndex !== -1) {
        storage.books.splice(req.matchIndex, 1)
        res.status(200).json({message: 'ок'})
    } else {
        res.status(404).json({message: 'Такая книга не найдена'})
    }
})
app.listen(url.port, ()=>{
    console.log('Сервер запущен')
})

function matchIndex(req, res, next) {
    const {id} = req.params
    req.matchIndex = storage.books.findIndex(e => e.id === id)
    next()
}