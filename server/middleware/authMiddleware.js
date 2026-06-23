const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {

    let token;

    // Check Authorization Header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {

        try {

            // Get Token from Header
            token = req.headers.authorization.split(' ')[1];

            // Verify Token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            // Save user data in request
            req.user = decoded;

            next();

        } catch (error) {

            console.log(error);

            return res.status(401).json({
                message: 'Invalid Token'
            });
        }

    } else {

        return res.status(401).json({
            message: 'No Token, Authorization Denied'
        });
    }
};

module.exports = { protect };