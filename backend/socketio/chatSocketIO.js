const socketIO = require('socket.io');
const chatDB = require('../routes/models/chatModel');
const volunteerDB = require('../routes/models/volunteerModel');
const organizationDB = require('../routes/models/organizationModel');
const moongose = require('mongoose');

let io;

const initSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: '*', // Replace with the actual origin of your SvelteKit app
            credentials: true,
            methods: ['GET', 'POST'],
            transports: ['websocket', 'polling'],
        }
    });

    io.on('connection', socket => {
        console.log('User Connected');

        /* let eventID = '';

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
        */
        socket.on('joinAtt', (volScheduleID) => {
            socket.join(volScheduleID);
        });

        socket.on('joinRoom', async ({ eventID }) => {
            try {
                socket.join(eventID);
                const messages = await chatDB.find({ EventID: eventID })
                    .sort({ createdAt: 1 })
                    .lean();
                const populatedMessages = await Promise.all(messages.map(async message => {
                    if (message.userType === 'Volunteer') {
                        message.UserID = await volunteerDB.findById(message.UserID, 'Name').lean();
                    } else if (message.userType === 'Organization') {
                        message.UserID = await organizationDB.findById(message.UserID, 'Name').lean();
                    }
                    return message;
                }));
                socket.emit('loadMessages', populatedMessages);
            } catch (error) {
                console.error('Error joining room and loading messages:', error);
            }
        });

        socket.on('sendMessage', async ({ eventID, userID, userType, message }) => {
            try {
                const chat = new chatDB({
                    Message: message,
                    EventID: eventID,
                    UserID: userID,
                    userType: userType
                });
                await chat.save();
                const savedMessage = await chatDB.findById(chat._id)
                    .populate({
                        path: 'UserID',
                        select: 'Name',
                        options: { lean: true }
                    })
                    .lean();
                io.to(eventID).emit('message', savedMessage);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        })
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