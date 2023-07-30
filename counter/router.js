const { readFile, writeFile } = require('fs/promises')

async function writeDB(data) {
    await writeFile(`${__dirname}\\db.json`, JSON.stringify(data))
    .catch(err => console.log(err, 'ошибка при записи writeDB'))
}

async function readBD() {
    return await readFile(`${__dirname}\\db.json`, {encoding: 'utf-8'})
    .then(data => {
        data = JSON.parse(data)
        return data
    })
    .catch(err => console.log(err, 'ошибка при чтении readBD'))
}
function overlapId(id, map) {
    for (const elem of map) {
        if(elem.id === id) return true
    }
    return false
}


const router = {
    getCounter: function(id, req, res){
        if(id && req.method === 'GET') {
            // только записываем в db при создании книги
            (async function() {
                const db = await readBD()
                // проверка на перекрытие id
                if(overlapId(id, new Map(db))) {
                    throw Error(`${id} уже есть в db`)
                }
                db.push([id, 0])
                await writeDB(db)
                res.statusCode = 200
                res.end()
            })()
        }
        return this
    },
    postIncrCounter: function(id, req, res){
        if(id && req.method === 'POST' && req.url.includes('incr')) {
            // при посещении страницы книги
            (async function() {
                const db = await readBD()
                const map = new Map(db)
                const val = map.get(id)
                if(val !== undefined) {
                    map.set(id, val + 1)
                    res.end(JSON.stringify({data: val + 1}))
                    await writeDB(Array.from(map.entries()))
                } else {
                    throw Error('нет значения в бд')
                }
            })()
        }
        return this
    },
    postDelCounter: function(id, req, res){
        if(id && req.method === 'POST' && req.url.includes('delete')) {
            (async function(){
                const db = await readBD()
                const map = new Map(db)
                map.delete(id)
                res.end()
                await writeDB(Array.from(map.entries()))
            })()
        }
        return this
    }
}

module.exports = router