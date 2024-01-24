const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const cors = require('cors')
const app = express();
const mongoose = require('mongoose');

app.use(morgan("tiny"));
app.use(bodyparser.json());
app.use(cors())

mongoose.connect('mongodb://127.0.0.1:27017/devTestFYP');

const generateQRRoute = require('./routes/generateQR')
const decodeQRQRRoute = require('./routes/decodeQR')
const signupRoute = require('./routes/signup')
const signinRoute = require('./routes/signin')
app.use("/", generateQRRoute);
app.use("/", decodeQRQRRoute);
app.use("/", signupRoute);
app.use("/", signinRoute);

app.listen(8083, () => {
    console.log(`Server is running on port 8083`);
})

