const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtVerify = (allowedUserTypes) => async (req, res, next) => {
    const jwtHeader = req.header("Authorization");
    const token = jwtHeader.split(' ')[1];
    // req.header("User-Agent")
    console.log(token);

    if (!jwtHeader) {
        return res.status(401).json({ message: 'Token not provided.' });
    }

    if (!token) {
        return res.status(401).json({ message: 'Token not provided.' });
    }

    try {
        const user = await jwt.verify(token, process.env.JWT_SECRETKEY);
        res.locals.userID = user.userID;
        if (!allowedUserTypes.includes(user.userType)) {
            return res.status(401).json({ message: 'User not authorized.' });
        }
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token.' });
    }
}

module.exports = jwtVerify;
