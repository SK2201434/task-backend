const express = require('express');
const connectDb = require("./DbConnection/DbConnection");
const dotenv = require("dotenv").config();
const router = require('./routers/router');


const app = express();
connectDb();



const port = process.env.PORT || 5001;

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/', require('./routers/router'));


app.listen(port, () => {console.log(`Server running on port ${port}`)});

