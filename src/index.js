const mongoose = require('mongoose');
const express = require("express")
const route = require("./route/routes")
const mongoose = require("mongoose")
const multer = require('multer')
const app = express()

app.use(express.json())
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


