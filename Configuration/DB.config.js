const mongoose = require('mongoose');
require('dotenv').config()
const user = process.env.USER;
const password = process.env.PASSWORD;

const connectDB = () => {
    try {
        mongoose.connect('mongodb+srv://lnt.830hqw2.mongodb.net/?retryWrites=true&w=majority',
        {
            user: user,
            pass: password,
            dbName: 'LNT',
        }).then(() => {
            console.log("server connected to database...")
        });
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = {connectDB};