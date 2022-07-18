const bookModel = require("../models/booksModel")
const reviewModel = require('../models/reviewModel')
const userModel = require('../models/userModel')
const mongoose = require("mongoose")
const moment = require("moment")
const aws = require('aws-sdk')
const ObjectId = mongoose.Types.ObjectId




aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async (file) =>{
   return new Promise( function(resolve, reject) {
    // this function will upload file to aws and return the link
    let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws

    var uploadParams= {
        ACL: "public-read",
        Bucket: "classroom-training-bucket",  //HERE
        Key: "abc/" + file.originalname, //HERE 
        Body: file.buffer
    }


    s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}

const isValid = (str) => {
    if (str === undefined || str == null) return false;
    if (typeof str == "string" && str.trim().length == 0) return false;
    return true;
}
const rexIsbn = /^[1-9][0-9]{9,14}$/
const nRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z])$/
const dateMatch = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/
exports.createBook = async function (req, res) {
    try {
  
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = req.body
        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Title    cannot be empty" })
        }
        const foundTitle = await bookModel.findOne({ title })
        if (foundTitle) {
            return res.status(400).send({ status: false, message: "This title is alreay being used" })
        }
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "excerpt cannot be empty" })
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId cannot be empty" })
        }
        if (!mongoose.isValidObjectId(userId))  {
            return res.status(400).send({ status: false, message: "Invalid userId" })
        }

        const userFound = await userModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(400).send({ status: false, message: "User not found" })
        }

        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN cannot be empty" })
        }
        if (!rexIsbn.test(ISBN)) return res.status(400).send({ status: false, message: "ISBN is invalid use 10 to 15 digit ISBN" })
        const foundISBN = await bookModel.findOne({ ISBN })
        if (foundISBN) {
            return res.status(400).send({ status: false, message: "This ISBN is already being used" })
        }

        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: "category cannot be empty" })
        }
        if (!nRegex.test(category)) {
            return res.status(400).send({ status: false, message: "catgory contains invalid character" })
        }
        if (!isValid(subcategory)) {
            return res.status(400).send({ status: false, message: "subcategory cannot be empty" })
        }
        if (!(/[A-Za-z][A-Za-z0-9_]{1,29}/.test(subcategory))) {
            //category validation
            res
              .status(400)
              .send({ status: false, message: `subcategory  can not be empty` });
            return;
          }
      
        // if (!nRegex.test(subcategory)) {
        //     return res.status(400).send({ status: false, message: "subcatgory contains invalid character" })
        // }
        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: "releasedAt cannot be empty" })
        }
        if (!dateMatch.test(releasedAt)) {
            return res.status(400).send({ status: false, message: "releasedAt is in invalid format" })
        }
        if (moment(releasedAt) > moment()) return res.status(400).send({ status: false, message: "releasedAt cannot be in future" })
        let files= req.files
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            bookCover = uploadedFileURL
        }
        let bookCreated = await bookModel.create({ title, excerpt, userId, ISBN, category, subcategory, releasedAt,bookCover })
        // if (moment(releasedAt) > moment()) return res.status(400).send({ status: false, message: "releasedAt cannot be in future" })
        let noDate = moment().format(releasedAt, "YYYYMMDD")
        bookCreated = bookCreated.toObject()
        bookCreated.releasedAt = noDate
        
        res.status(201).send({ status: true, message: 'Success', data: bookCreated })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }

}

exports.getBook = async function (req, res) {
    try {
        let filters = req.query

        if (Object.keys(filters).length === 0) {

            let books = await bookModel.find({ isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

            if (books.length == 0) { return res.status(404).send({ status: false, message: "No result found" }) }
            let sortedBooks = books.sort(function (a, b) {
                var titleA = a.title.toUpperCase(); // ignore upper and lowercase
                var titleB = b.title.toUpperCase(); // ignore upper and lowercase
                if (titleA < titleB) {
                    return -1; //titleA comes first
                }
                if (titleA > titleB) {
                    return 1; // titleB comes first
                }
                return 0;
            })
            return res.status(200).send({ status: true, message: 'Books list', data: sortedBooks })

        } else {
            Object.keys(filters).forEach(x => filters[x] = filters[x].trim())
            if (filters.userId) {
                if (filters.userId.length !== 24) { return res.status(400).send({ status: false, message: " UserId Invalid " }) }
            }

            if (filters.subcategory) {
                if (filters.subcategory.includes(",")) {
                    let subcatArray = filters.subcategory.split(",").map(String).map(x => x.trim())
                    filters.subcategory = { $all: subcatArray }
                }
            }
        }
        filters.isDeleted = false;
        let filteredBooks = await bookModel.find(filters).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })

        if (filteredBooks.length === 0) return res.status(404).send({ status: false, message: "No such data available" })
        else {
            let sortedBooks = filteredBooks.sort(function (a, b) {
                var titleA = a.title.toUpperCase(); // ignore upper and lowercase
                var titleB = b.title.toUpperCase(); // ignore upper and lowercase
                if (titleA < titleB) {
                    return -1; //titleA comes first
                }
                if (titleA > titleB) {
                    return 1; // titleB comes first
                }
                return 0;
            })
            return res.status(200).send({ status: true,message: 'Books list',data: sortedBooks })

        }

    }
    catch (err) {
        
        res.status(500).send({ status: false, message: err.message })
    }
}

exports.getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId
        if (!(ObjectId.isValid(bookId))) return res.status(400).send({ status: false, message: 'Enter a valid ObjectId' })
        let findBook = await bookModel.findOne({ _id: bookId,isDeleted:false }).select({ deletedAt: 0 })
        if (!findBook) return res.status(404).send({ status: false, message: "no data found" })
        let findReview = await reviewModel.find({ bookId: bookId,isDeleted:false })

        let result = { ...findBook.toJSON(), reviewsData: findReview }

        res.status(200).send({ status: true, message: "Book-list", data: result })


    } catch (err) {
        res.status(500).send(err.message)
    }
}
// <=============================DeleteBooks==================================================>

exports.deleteBooks = async function (req, res) {
    try {
        const bookId = req.params.bookId
        const isValidBookId = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!isValidBookId) {
            return res.status(404).send({ status: false, message: "book is not available" })
        }
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: `${bookId} is not a valid ObjectId😥😥` })

        const deleteBook = await bookModel.findByIdAndUpdate(bookId, { isDeleted: true, deletedAt: new Date() },
            { new: true })
        res.status(200).send({ status: true, message: "Success",data:deleteBook })
    }
    catch (err) {
        
        res.status(500).send({ message: err.message })
    }
}
// <=============================UpdateBooks==================================================>

exports.updateBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId
        // if (bookId== null||bookId=="") { 
        //     return res.status(400).send(" BookId is not available")
        //  }
        if (bookId.length != 24) {
            return res.status(400).send({ status: false, message:" BookId Invalid "})
        }
        let book = await bookModel.findById(bookId);
        if (Object.keys(book).length == 0 || book.isDeleted == true) {
            return res.status(404).send({ status: false, message:" No such data found "})
        }
        let reqData = req.body;
       
        let upData = {};
        if (reqData.title) {
            if(reqData.title.trim()){
            const foundTitle = await bookModel.findOne({ title:reqData.title })
            if (foundTitle) {
                return res.status(400).send({ status: false, message: "This title is alreay being used" })
            }
            upData.title = reqData.title;
        }
        }
        if (reqData.excerpt) {
            if(reqData.excerpt.trim()){

            upData.excerpt = reqData.excerpt;
            }
        }
        if (reqData.ISBN) {
            if (!rexIsbn.test(reqData.ISBN)) return res.status(400).send({ status: false, message: "ISBN is invalid use 10 to 15 digit ISBN" })
            const foundISBN = await bookModel.findOne({ ISBN:reqData.ISBN})
            if (foundISBN) {
                return res.status(400).send({ status: false, message: "This ISBN is already being used" })
            }
            upData.ISBN = reqData.ISBN;
        }
        if (reqData.releasedAt) {
            if (!dateMatch.test(reqData.releasedAt)) {
                return res.status(400).send({ status: false, message: "releasedAt is in invalid format" })
            }
            if (moment(reqData.releasedAt) > moment()) return res.status(400).send({ status: false, message: "releasedAt cannot be in future" })
           
            upData.releasedAt = reqData.releasedAt;
        }

        if (Object.keys(upData).length == 0) {
            return res.status(400).send({ status: false, message:" No data to update "})
        }
        // upData.releasedAt = new Date()
        let updated = await bookModel.findOneAndUpdate({ _id: bookId }, upData, { new: true })
        res.status(200).send({ status: true,message: 'Success',Data: updated })


    }
    catch (err) {
        res.status(500).send({ message: err.message })
    }

}
