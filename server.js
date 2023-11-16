const express = require('express');
const connectDb = require("./DbConnection/DbConnection");
const dotenv = require("dotenv").config();

const router = require('./routers/router');


connectDb();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json());



app.use('/', require('./routers/router'));


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

