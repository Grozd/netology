const { readFile, writeFile } = require('fs/promises')

// вспомогательные методы
async function conveyor(middleware) {
    let db = await readDB()
    db = middleware(db)
    await writeDB(db)
}

async function writeDB(data) {
    await writeFile(`${__dirname}/db.json`, JSON.stringify(data))
    .catch(err => console.log(err, 'ошибка при записи writeDB'))
}

async function readDB() {
    return await readFile(`${__dirname}/db.json`, {encoding: 'utf-8'})
    .then(data => {
        data = JSON.parse(data)
        return data
    })
    .catch(err => console.log(err, 'ошибка при чтении readDB'))
}

// методы для книг
async function add(table, payload) {
    await conveyor((data) => {
        for (const key in data[table]) {
            if(key === String(payload.id)) throw Error(`совпадение ключей в db при добавлении ${table}`)
        }
        data[table][payload.id] = payload
        data[table].length += 1
        return data
    })
}

async function setById(table, id, payload) {
    await conveyor((data) => {
        for (const key in data[table]) {
            if (Object.hasOwnProperty.call(data[table], key)) {
                if(data[table][key].id === id && key === id) {
                    data[table][key] = payload
                    return data
                }
            }
        }
    })
    return true
}

async function removeById(table, id) {
    await conveyor((data) => {
        for (const key in data[table]) {
            if (Object.hasOwnProperty.call(data[table], key)) {
                if(data[table][id]) {
                    delete data[table][id]
                    data[table].length -= 1
                }
            }
        }
        return data
    })
}

async function getAllBooks() {
    let db = await readDB()
    return db['books']
}

async function getById(table, id) {
    let db = await readDB()
    for (const key in db[table]) {
        if (Object.hasOwnProperty.call(db[table], key)) {
            if(db[table][key].id === id && key === id) return db[table][key]
        }
    }
    return false
}

async function getIdBookByTitleAndAuthors(title, authors) {
    let db = await readDB()
    for (const key in db['books']) {
        if (Object.hasOwnProperty.call(db['books'], key)) {
            if(db['books'][key].title === title && db['books'][key].authors === authors) {
                return db['books'][key].id
            }
        }
    }
    return false
}

async function setFileCover(id, path) {
    await conveyor(db => {
        for (const key in db['books']) {
            if (Object.hasOwnProperty.call(db['books'], key)) {
                if(db['books'][key].id === id) {
                    db['books'][key].fileCover = path
                }
            }
        }
        return db
    })
}

module.exports = {
    add,
    removeById,
    getAllBooks,
    setById,
    getById,
    getIdBookByTitleAndAuthors,
    setFileCover
}
