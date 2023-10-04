const path = require('node:path')
const express = require('express')
const mongoose = require('mongoose')
const createServerIO = require('./socketIO')
const handleErrors = require('./middleware/handleErrors')
const cookieParser = require('cookie-parser')
const Role = require('./models/Role')
const router = require('./routes')
const { passport_Sess, forSaveSessionInDB } = require('./middleware/passport')

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {maxPoolSize: 10})
        //await mongoose.connect('mongodb://127.0.0.1:27017/library', {maxPoolSize: 10})
        // создание ролей единожды
        let foundRole = await Role.find({ $or: [{ name: 'guest' },{ name: 'user' },{ name: 'admin' }]})
        if(foundRole.length !== 3) {
            const roleGuest = new Role({name: 'guest'})
            const roleUser = new Role({name: 'user'})
            const roleAdmin = new Role({name: 'admin'})
            await roleGuest.save()
            await roleUser.save()
            await roleAdmin.save()
        }
        
        return mongoose.connection.getClient()
        
    } catch (error) {
        console.log('ошибка соединения или создания ролей')
    }
    
}

async function start(client) {
    try {
        const express_Sess = forSaveSessionInDB(client)
        const app = express()
        app.use(express.static(__dirname+'/public'))
        app.set('views', path.join(__dirname, 'views'))
        app.set('view engine', 'ejs')
        app.use(express.urlencoded({extended: false}))
        app.use(express.json())
        app.use(cookieParser())
        app.use([express_Sess, passport_Sess])
        app.use(router)
        app.use(handleErrors)
        const serverIO = createServerIO(app, express_Sess)

        serverIO.listen(process.env.PORT, ()=>{
            console.log('Сервер запущен')
        })

    } catch (error) {
        console.log(error);
        await client.close();
    }
}

(async function(){
    let client = await connectDB()
    start(client)
    .catch(err=>{
        console.log(err, 'ошибка запуска app')
    })
})()
