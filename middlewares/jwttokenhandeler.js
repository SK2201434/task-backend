const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const tokenBlacklist = require('../tokenBlacklist');


const validateToken = asyncHandler(async (req, res, next) => {
    try {
        let token;
        let authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith("Bearer")) {
            token = authHeader.split(" ")[1];

            if (tokenBlacklist.has(token)) {
                return res.status(401).json({ message: 'Please Login Again' });
            }

            jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
                if (err) {
                    console.error('Token Verification Error:', err);
                    res.status(401);
                    throw new Error("User is not authorized");
                }

                req.user = decoded.user;
                next();
            });
        } else {
            res.status(401);
            throw new Error("Authorization header missing or invalid");
        }
    } catch (error) {
        console.error('Error in combinedMiddleware:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = validateToken;
