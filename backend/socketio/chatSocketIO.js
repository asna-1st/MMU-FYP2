const socketIO = require('socket.io');

let io;
const Message = require('../routes/models/chatModel')

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: 'http://localhost:5173', // Replace with the actual origin of your SvelteKit app
            credentials: true,
            methods: ['GET', 'POST'],
            transports: ['websocket', 'polling'],
        }
    });

    io.on('connection', (socket) => {
        console.log('User Connected');

        let eventID = '';

        socket.on('joinChat', (room) => {
            socket.join(room);
            eventID = room;
        });

        socket.on('message', async (data) => {
            console.log('Received message:', data);
            const { username, message, eventID} = data;
            const createdAt = new Date();
            const newMsg = new Message({ username, message, eventID });
            await newMsg.save();
            io.to(eventID).emit('message', { username, message, createdAt });
            console.log({ username, message, createdAt })
        });
    });
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized!');
    }
    return io;
}

module.exports = {
    initSocket,
    getIO
};