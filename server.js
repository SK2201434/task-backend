const express = require('express');
const connectDb = require("./DbConnection/DbConnection");
const dotenv = require("dotenv").config();
const router = require('./routers/router');
const cors = require("cors")

const app = express();
connectDb();

const corsOptions = {
    origin:"http://localhost:5173",
    methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
    credential: true,
}
app.use(cors(corsOptions))


const port = process.env.PORT || 5002;

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/', require('./routers/router'));


app.listen(port, () => {console.log(`Server running on port ${port}`)});

