const { createServer } = require('http')
const router = require('./router')

createServer((req, res) => {
    //console.log('запрос пришел', req.url, req.method);
    const url = new URL(`http://test${req.url}`)
    const reg = url.pathname.match(/counter\/([a-z\d-]*)/i)
    const id = reg[1]

    router
    .getCounter(id, req, res)
    .postIncrCounter(id, req, res)
    .postDelCounter(id, req, res)

}).listen(3001,console.log('counter run server'))