const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const cors = require('cors')
const app = express();
const mongoose = require('mongoose');
const { initSocket } = require('./socketio/chatSocketIO');
const http = require('http');
const ioserver = http.createServer(app);
const initData = require('./initData');
app.use(morgan("tiny"));
app.use(bodyparser.json());
//app.use(cors({ origin: 'http://localhost:5173', credentials: true, method: 'GET,HEAD,PUT,PATCH,POST,DELETE', exposedHeaders: '*' }))
app.use(cors({
  origin: 'http://localhost:5173', // specify origin here
  methods: ['GET', 'POST'], // specify allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // specify allowed headers
}));

mongoose.connect('mongodb://127.0.0.1:27017/devTestFYP');

const generateQRRoute = require('./routes/generateQR')
const decodeQRQRRoute = require('./routes/decodeQR')
const signupRoute = require('./routes/signup')
const signinRoute = require('./routes/signin');
const chatHistory = require('./routes/chat');
const scheduleToute = require('./routes/schedule');
const eventRoute = require('./routes/event');
app.use("/", generateQRRoute);
app.use("/", decodeQRQRRoute);
app.use("/", signupRoute);
app.use("/", signinRoute);
app.use("/chat", chatHistory);
app.use("/", scheduleToute);
app.use("/event", eventRoute);

initSocket(ioserver);
//initData();
ioserver.listen(8083, () => {
  console.log(`Server is running on port 8083`);
})

