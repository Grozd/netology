const { createServer } = require('http')
const router = require('./router')

createServer((req, res) => {
    const url = new URL(`http://localhost:3001${req.url}`)
    const reg = url.pathname.match(/counter\/([a-z\d-]*)/i)
    const id = reg[1]

    res.setHeader('Access-Control-Allow-Origin', '*')

    router
    .getCounter(id, req, res)
    .postIncrCounter(id, req, res)
    .postDelCounter(id, req, res)

}).listen(3001, console.log('counter run server'))