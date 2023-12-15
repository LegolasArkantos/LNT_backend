const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../Models/User.model');
const Teacher = require('../Models/Teacher.model');
const Student = require('../Models/Student.model');

// Generate JWT Token
const generateToken = (userProfileId, role) => {
    const accessToken = jwt.sign({ profileID: userProfileId, role: role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ profileID: userProfileId, role: role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '24h' });

    return { accessToken, refreshToken };
};


const signup = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check password format (at least 8 characters, containing letters and numbers)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Invalid password format' });
        }

        const result = await User.findOne({email});

        if(result != null) {
            res.status(400).send('Email already exist, Please login.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            role
        })

        

        if (role === 'Teacher') {
            const { firstName, lastName, profilePicture, educationalCredentials, subjectsTaught} = req.body;
            const profile = await Teacher.create({ firstName, lastName, profilePicture, educationalCredentials, subjectsTaught });
            user.profileID = profile._id;
        } else if (role === 'Student') {
            const { firstName, lastName, profilePicture, educationalLevel } = req.body;
            const profile = await Student.create({ firstName, lastName, profilePicture, educationalLevel });
            user.profileID = profile._id;
        }

        const finalResult = await user.save();

        // const tokens = generateToken(user._id);

        res.status(201).json(finalResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};



const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokens = generateToken(user.profileID, user.role);
        res.status(200).json(tokens);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const getAccessToken = async (req,res) => {
    const accessToken = jwt.sign({ profileID: req.user.profileID, role: req.user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.status(200).json({accessToken: accessToken});
};

// const refreshTokens = (req, res) => {
//     const refreshToken = req.body.refreshToken;

//     if (!refreshToken) {
//         return res.status(401).json({ message: 'Refresh token not provided' });
//     }

//     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
//         if (err) {
//             return res.status(403).json({ message: 'Invalid refresh token' });
//         }

//         const accessToken = jwt.sign({ userId: user.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

//         res.json({ accessToken });
//     });
// };

module.exports = {
    signup,
    login,
    getAccessToken,
};