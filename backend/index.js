const express = require('express');
const morgan = require('morgan');
const bodyparser = require('body-parser');
const cors = require('cors')
const app = express();

app.use(morgan("tiny"));
app.use(bodyparser.json());
app.use(cors())

const generateQRRoute = require('./routes/generateQR')
const decodeQRQRRoute = require('./routes/decodeQR')
app.use("/", generateQRRoute);
app.use("/", decodeQRQRRoute);

app.listen(8083, () => {
    console.log(`Server is running on port 8083`);
})

