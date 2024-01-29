const express = require('express');
const connectDb = require("./DbConnection/DbConnection");
const dotenv = require("dotenv").config();
const router = require('./routers/router');
const cors = require("cors")

const app = express();
connectDb();

const corsOptions = {
    origin:"https://65b711c2b7d1d8d3d6756e7e--vermillion-otter-0c423c.netlify.app",
    methods:"GET,POST,PUT,DELETE,PATCH,HEAD",
    credential: true,
}
app.use(cors(corsOptions))


const port = process.env.PORT || 5002;
console.log(port)

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/', require('./routers/router'));


app.listen(port, () => {console.log(`Server running on port ${port}`)});

