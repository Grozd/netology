const mongoose = require('mongoose')

async function createModelAndRouter() {

    mongoose.connect(process.env.MONGODB_URL, {maxPoolSize: 10})
    //mongoose.connect('mongodb://127.0.0.1:27017/counter', {maxPoolSize: 10})
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

    return {
        getCounter: function(id, req, res) {
            if(id && req.method === 'GET') {
                (async function() {
                    const arrDocs = await modelCounter.where('idBook').equals(id)
                    if(arrDocs.length > 0) {
                        // возвращаем
                        res.statusCode = 200
                        res.end(JSON.stringify({data: arrDocs[0]['num']}))
                    } else {
                        // создаем
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
            if(id && req.method === 'POST' && req.url.includes('incr')) {
                // при посещении страницы книги
                (async function() {
                    const arrDocs = await modelCounter.where('idBook').equals(id)
                    if(arrDocs.length > 0) {
                        res.statusCode = 200
                        res.end(JSON.stringify({data: arrDocs[0]['num'] + 1}))
                        await modelCounter.findOneAndUpdate({idBook: {$eq: id}}, {...arrDocs, num: arrDocs[0]['num'] + 1})
                        const arrDocs2 = await modelCounter.where('num').gte(0)
                    } else {
                        throw Error('postIncrCounter нет значения в бд')
                    }
                })()
            }
            return this
        },
        postDelCounter: function(id, req, res) {
            if(id && req.method === 'POST' && req.url.includes('delete')) {
                (async function(){
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