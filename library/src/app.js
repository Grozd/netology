const express = require('express')
const path = require('path')
const app = express()
const router = require('./routes')
const { PORT } = require('./config.json')
app.use(express.static(__dirname+'/public'))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(router)
app.listen(PORT, ()=>{
    console.log('Сервер запущен')
})