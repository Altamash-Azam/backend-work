// require('dotenv').config({path: './env'})

import dotenv from 'dotenv'
import {app} from "./app.js"

import connectDB from "./db/connectdb.js";

dotenv.config({
    path: './env'
})

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send("hehehehe");
})

connectDB()
.then( ()=>{
    app.listen(port, () =>{
        console.log(`Server is running at port ${port}`)
    })
})
.catch((err) => {
    console.log("database connection failed  ", err)
})
