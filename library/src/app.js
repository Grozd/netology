const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session');
const passport = require('passport');
const handleErrors = require('./middleware/handleErrors')

// создние подключения к бд 'mongodb://127.0.0.1:27017/library' - без докера
async function createDB() {
    let client = await mongoose.connect(process.env.MONGODB_URL, {maxPoolSize: 10})
    client = client.connection
    client.useDb()
    return client
}

async function start(client) {

    try {
        const router = require('./routes')
        const app = express()
        app.use(express.static(__dirname+'/public'))
        app.set('views', path.join(__dirname, 'views'))
        app.set('view engine', 'ejs')
        app.use(express.urlencoded({extended: false}))
        app.use(express.json())
        app.use(session({
            secret: 'hello',
            resave: false,
            saveUninitialized: false
        }))
        app.use(passport.session());
        app.use(router)
        app.use(handleErrors)
        app.listen(process.env.PORT, ()=>{
            console.log('Сервер запущен')
        })

    } catch (error) {
        console.log(error);
        await client.close();
    }
}

(async function(){
    let client = await createDB()
    start(client)
    .catch(err=>{
        console.log('ошибка запуска app', err)
    })
})()
