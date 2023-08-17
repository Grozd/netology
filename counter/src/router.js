const mongoose = require('mongoose')
const { MONGODB_URL } = require('./config.json')

async function createModelAndRouter() {
    mongoose.connect(MONGODB_URL, {maxPoolSize: 10})
    let counterSchema = new mongoose.Schema({
        idBook: {
            type: String,
            required: true
        },
        num: {
            type: Number,
            required: true
        }
    })
    let modelCounter = mongoose.model('Counter', counterSchema)
    const countDoc = await modelCounter.estimatedDocumentCount()
    console.log('проверка', countDoc)

    return {
        getCounter: function(id, req, res) {
            console.log('getCounter')
            if(id && req.method === 'GET') {
                (async function() {
                    const arrDocs = await modelCounter.where('idBook').equals(id)
                    console.log('getCounter arrDocs====>', arrDocs)
                    if(arrDocs.length > 0) {
                        // есть возвращаем
                        res.statusCode = 200
                        res.end(JSON.stringify({data: arrDocs[0]['num']}))
                    } else {
                        console.log('getCounter создаем счетчик')
                        // нет создаем
                        let docCounter = new modelCounter({idBook: id, num: 0})
                        docCounter.save()
                        res.statusCode = 200
                        res.end(JSON.stringify({data: 0}))
                    }
                })()
            }
            return this
        },
        postIncrCounter: function(id, req, res){
            console.log('postIncrCounter')
            if(id && req.method === 'POST' && req.url.includes('incr')) {
                // при посещении страницы книги
                (async function() {
                    console.log('postIncrCounter запрос на существование id')
                    const arrDocs = await modelCounter.where('idBook').equals(id)
                    console.log('postIncrCounter find', arrDocs)
                    if(arrDocs.length > 0) {
                        res.statusCode = 200
                        res.end(JSON.stringify({data: arrDocs[0]['num'] + 1}))
                        await modelCounter.findOneAndUpdate({idBook: {$eq: id}}, {...arrDocs, num: arrDocs[0]['num'] + 1})
                        const arrDocs2 = await modelCounter.where('num').gte(0)
                        console.log('postIncrCounter arrDocs2', arrDocs2)
                    } else {
                        throw Error('postIncrCounter нет значения в бд')
                    }
                })()
            }
            return this
        },
        postDelCounter: function(id, req, res) {
            console.log('postDelCounter')
            if(id && req.method === 'POST' && req.url.includes('delete')) {
                (async function(){
                    console.log('postDelCounter async')
                    await modelCounter.findOneAndDelete({idBook: { $eq: id}})
                    res.statusCode = 200
                    res.end()
                })()
            }
            return this
        }
    }
}


module.exports = createModelAndRouter