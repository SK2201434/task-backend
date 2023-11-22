const express = require('express');
const connectDb = require("./DbConnection/DbConnection");
const dotenv = require("dotenv").config();
const router = require('./routers/router');
const fileUpload = require('express-fileupload');
const app = express();
connectDb();

app.use(fileUpload({useTempFiles:true}))

const port = process.env.PORT || 5001;

app.use(express.json());

app.use('/', require('./routers/router'));

app.listen(port, () => {console.log(`Server running on port ${port}`)});

