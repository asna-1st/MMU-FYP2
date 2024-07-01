const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const cors = require('cors')
const app = express();
const mongoose = require('mongoose');
const { initSocket } = require('./socketio/chatSocketIO');
const http = require('http');
const ioserver = http.createServer(app);

require('dotenv').config();

app.use(morgan("tiny"));
app.use(bodyparser.json());
//app.use(cors({ origin: 'http://localhost:5173', credentials: true, method: 'GET,HEAD,PUT,PATCH,POST,DELETE', exposedHeaders: '*' }))
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));

mongoose.connect(process.env.MONGODB_URL);
initSocket(ioserver);

const generateQRRoute = require('./routes/generateQR')
const decodeQRQRRoute = require('./routes/decodeQR')
const signupRoute = require('./routes/signup')
const signinRoute = require('./routes/signin');
const chatHistory = require('./routes/chat');
const scheduleToute = require('./routes/schedule');
const eventRoute = require('./routes/event');
const attendanceRoute = require('./routes/attendance');
const reportRoute = require('./routes/report');
const userRoute = require('./routes/user');
const analyticsRoute = require('./routes/analytics')

app.use("/", generateQRRoute);
app.use("/", decodeQRQRRoute);
app.use("/", signupRoute);
app.use("/", signinRoute);
app.use("/chat", chatHistory);
app.use("/schedule", scheduleToute);
app.use("/event", eventRoute);
app.use("/attendance", attendanceRoute);
app.use("/report", reportRoute);
app.use("/user", userRoute);
app.use("/analytics", analyticsRoute);

//initData();
ioserver.listen(process.env.PORT, () => {
  console.log(`Server is running on port 8083`);
})

