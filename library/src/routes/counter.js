const router = require('express').Router()
const { request } = require('http')

router.get('/counter/:bookId', (req, res) => {
    //const id = req.params[0]

    const options = {
        hostname: 'localhost',
        port: '3001',
        path: `${req.url}`,
        method: 'GET'
    }

    const clientReq = request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
          console.log('No more data in response.');
        });
    })
    clientReq.on('error', e => {
        console.error(`problem with request: ${e.message}`);
    })

    clientReq.end()
})

router.post('/counter/:bookId/incr', (req, res) => {
    const options = {
        hostname: 'localhost',
        port: '3001',
        path: `${req.url}`,
        method: 'POST'
    }

    const clientReq = request(options, (res) => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
        });
        res.on('end', () => {
          console.log('No more data in response.');
        });
    })
    clientReq.on('error', e => {
        console.error(`problem with request: ${e.message}`);
    })

    clientReq.end()
})

module.exports = router