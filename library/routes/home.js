const router = require('express').Router()
const storage = require('../storage')

router.get('/', (req, res, next) => {
    res.render('./pages/index', {
        title: storage.getContent('title'),
        books: storage.getAllBooks()
    },
    (err, html) => {
        if(err) throw err
        res.send(html)
    })
})

module.exports = router