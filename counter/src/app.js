const { createServer } = require('http')
const { PORT } = require('./config.json');
const createModelAndRouter = require('./router')

function startServer(router){
    console.log('app async')
    createServer((req, res) => {
        console.log('запрос пришел', req.url, req.method);
        const url = new URL(`http://test${req.url}`)
        const reg = url.pathname.match(/counter\/([a-z\d-]*)/i)
        const id = reg[1]
    
        router
        .getCounter(id, req, res)
        .postIncrCounter(id, req, res)
        .postDelCounter(id, req, res)
    
    }).listen(PORT,console.log('counter run server'))
}

(async function(){
    const router = await createModelAndRouter()
    startServer(router)
})()