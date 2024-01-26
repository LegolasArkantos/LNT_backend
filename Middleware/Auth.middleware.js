const jwt = require('jsonwebtoken');

const authenticateTeacher = (req, res, next) => {
    const accessToken = req.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token not provided' });
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        if (user.role != 'Teacher') return res.sendStatus(403);

        req.user = user;
        next();
    });
};

const authenticateStudent = (req, res, next) => {
    const accessToken = req.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token not provided' });
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        if (user.role != 'Student') return res.sendStatus(403);

        req.user = user;
        next();
    });
};

const authenticateUser = (req, res, next) => {
    const accessToken = req.headers['authorization']?.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ message: 'Access token not provided' });
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        if (user.role != 'Student' && user.role != 'Teacher') return res.sendStatus(403);

        req.user = user;
        next();
    });
};

const authenticateRefresh = (req,res,next) => {
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err,user) => {
        if(err) return res.sendStatus(403);
        
        req.user = user;
        next();
    });
};

module.exports = {
    authenticateTeacher,
    authenticateStudent,
    authenticateRefresh,
    authenticateUser
};