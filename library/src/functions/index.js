//const { COUNTER_URL } = require('../config.json')
const { ServerError } = require('../models/Errors')
const Comment = require('../models/Comment')

// ASYNC
// запрос на создание счетчика для книги
async function getCounter(id, next) {
    try {
        //let response = await fetch(`${COUNTER_URL}/counter/${id}`)
        let response = await fetch(`${process.env.COUNTER_URL}/counter/${id}`)
        response = await response.json()
        return response.data
    } catch (error) {
        next(new ServerError('Ошибка на стороне сервера. Нет соединения с одним из сервисов'))
    }
}
// запрос на увеличение счетчика для книги
async function postIncrCounter(id) {
    try {
        //let response = await fetch(`${COUNTER_URL}/counter/${id}/incr`, {
        let response = await fetch(`${process.env.COUNTER_URL}/counter/${id}/incr`, {
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
        //fetch(`${COUNTER_URL}/counter/${id}/delete`, {
        fetch(`${process.env.COUNTER_URL}//counter/${id}/delete`, {
            method: 'POST'
    })
    } catch (error) {
        next(new ServerError('Ошибка на стороне сервера. Нет соединения с одним из сервисов'))
    }
}

async function renderView(req, res) {
    let viewCounter
    if(req.method === 'POST') {
        viewCounter = await getCounter(req.idBook)
    }
    if(req.method === 'GET') {
        viewCounter = await postIncrCounter(req.idBook)
    }
    const arrComments = await Comment.getAllByBook(req.idBook)
    const data = {
        book: req.matchBook,
        viewCounter,
        user: getUser(req),
        arrComments
    }
    res.render('./pages/view', { data })
}


// SYNC
function getUser(req) {
    return req.user
        ? { id: req.user._id, username: req.user.username }
        : false
}

module.exports = {
    getCounter,
    postIncrCounter,
    postDelCounter,
    getUser,
    renderView
}