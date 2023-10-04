const { Server } = require('node:http');
const socketIO = require('socket.io');
const { Comment, User } = require('../models')

function createServerIO(app, express_Sess) {
    const server = Server(app)
    const io = socketIO(server);

    // связь express-session и socket.io. 
    io.engine.use(express_Sess);

    io.on('connection', async (socket) => {
        socket.on('commentCreated', async (msg) => {
            const curDate = new Date()
            msg.author = socket.request.session.passport.user
            msg.timestamp = curDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
            Comment.createComment(msg)
            msg.author = await User.getById(socket.request.session.passport.user)
            io.emit('commentCreated', msg);
        });
        socket.on('disconnect', () => {
            console.log('server: user disconnected');
        });
    });
    io.engine.on("connection_error", (err) => {
        console.log(err.req);
        console.log(err.code);
        console.log(err.message);
        console.log(err.context);
    });

    return server
}

module.exports = createServerIO