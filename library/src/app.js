const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const handleErrors = require('./middleware/handleErrors')

async function listDatabases(client){
    let databasesList = await client.db.admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}

async function createDB() {
    let client = await mongoose.connect(process.env.MONGODB_URL, {maxPoolSize: 10})
    client = client.connection
    client.useDb()
    //await listDatabases(client)
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
        app.use(router)
        app.use(handleErrors)
        app.listen(process.env.PORT, ()=>{
            console.log('Сервер запущен')
        })

    } catch (error) {
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
