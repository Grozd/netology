const express = require('express')
const app = express()
const router = require('./routes')
const { port } = require('./config.json')
//проверка для html формы
//app.use(express.static('./', {index: 'index.html'}))
app.use(express.json())
app.use(router)
app.listen(port, ()=>{
    console.log('Сервер запущен')
})