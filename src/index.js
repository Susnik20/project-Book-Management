const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const express = require("express")
const app = express();
const multer=require('multer')
const route = require('./route/routes');
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json());

app.use(multer().any())

mongoose.connect("mongodb+srv://kaluram123:iKetOTUhK5vten7w@cluster0.4yhyg.mongodb.net/group27Database?retryWrites=true&w=majority", {
   // useNewUrlParser: true
})
    .then(() => console.log("MongoDB is connected successfully........"))
    .catch((error) => console.log(error))

    app.use("/", route)

    app.listen(process.env.PORT || 3000, (err)=> {
        console.log(" Server connected on PORT 3000✅✅✅ ")
    })


