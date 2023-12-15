require('dotenv').config(); 

const express = require('express');

const {connectDB} = require('./Configuration/DB.config');

const app = express();

const PORT = process.env.PORT;

//middleware
app.use(express.json());


connectDB();

app.listen(PORT, () => {
    console.log("server connected and listening on port " + PORT);
});
