const express = require("express")
//const bodyParser=require("bodyParser")
const route = require("./route/routes")
const mongoose = require("mongoose")
const multer = require('multer')
const app = express()

app.use(express.json())
app.use(multer().any())

mongoose.connect("mongodb+srv://kaluram123:iKetOTUhK5vten7w@cluster0.4yhyg.mongodb.net/group27Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("mongoDB is connected successfully........"))
    .catch((error) => console.log(error))

app.use("/", route)

const PORT = process.env.PORT || 3000

app.listen(PORT, function () { console.log(`Express is running on port ${PORT}`) })


