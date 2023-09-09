const { createServer } = require('http')
const createModelAndRouter = require('./router')

function startServer(router){
    createServer((req, res) => {
        const url = new URL(`http://test${req.url}`)
        const reg = url.pathname.match(/counter\/([a-z\d-]*)/i)
        const id = reg[1]
    
        router
        .getCounter(id, req, res)
        .postIncrCounter(id, req, res)
        .postDelCounter(id, req, res)
    
    }).listen(process.env.PORT,console.log('counter run server'))
}

(async function(){
    const router = await createModelAndRouter()
    startServer(router)
})()