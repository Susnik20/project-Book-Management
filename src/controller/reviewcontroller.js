const reviewModel = require('../models/reviewModel')
const booksModel = require('../models/booksModel')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId
const moment = require("moment")



/**************************************Start's Create Review Api's😍😊****************************************/
exports.createReview = async function (req, res) {
    try {
        let { reviewedBy, review, rating } = req.body

        let bookId = req.params.bookId.trim()
        if (bookId.length != 24) { return res.status(400).send({ status: false, message: "object id is not valid" }) }

        if (!(/^[A-Za-z0-9#@*. ]{1,}$/.test(review))) return res.status(400).send({ status: false, message: 'review cant be blank or invalid' })
        if (review) { if (!review.trim()) { return res.status(400).send({ status: false, message: 'review cant be blank' }) } }
        let findBook = await booksModel.findOne({ _id: bookId, isDeleted: false })

        if (!findBook) return res.status(404).send({ status: false, message: 'your searched book is not exist😥😥' })

        let details = {}
        const formatedDate = moment(Date.now()).toISOString()
        details.reviewedAt = formatedDate;

        details.bookId = bookId.trim()
        if (!reviewedBy.trim()) reviewedBy = 'Guest'
        details.reviewedBy = reviewedBy.trim()

        if (review) { details.review = review.trim() }

        details.rating = rating

        let setReview = await reviewModel.create(details)

        let updateBook = await booksModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: 1 } }, { new: true })

        let mixed = { ...updateBook.toJSON(), reviewsData: setReview }

        res.status(201).send({ status: true, message: "Success", data: mixed })


    } catch (err) {
        res.status(500).send(err.message)
    }
}

/**************************************End Create Review Api's😍😊****************************************/

/**************************************Start's Delete Review Api's😍😊****************************************/
exports.deleteReview = async function (req, res) {
    try {
        let bookId = req.params.bookId

        let reviewId = req.params.reviewId
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: 'please provide a valid BookId' })

        if (!ObjectId.isValid(reviewId)) return res.status(400).send({ status: false, message: 'please provide a valid reviewId ' })

        //  let findBook = await booksModel.findOne({ _id: bookId })

        let findBook = await booksModel.findOne({ _id: bookId, isDeleted: false })

        if (!findBook) return res.status(404).send({ status: false, message: "no such book exist🤷‍♂️🤷‍♂️" })

        let findreview = await reviewModel.findOneAndUpdate({ bookId: bookId, _id: reviewId, isDeleted: false }, { $set: { isDeleted: true } }, { new: true })

        if (!findreview) return res.status(404).send({ status: false, message: 'no such review exist😥😥' })

        let updateBook = await booksModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } }, { new: true })
        res.status(200).send({ status: true, message: "Success", data: findreview })


    } catch (err) {
        res.status(500).send(err.message)
    }
}

/**************************************End Delete Review Api's😍😊****************************************/


/**************************************Start's  Review Put Api's😍😊****************************************/

exports.UpdateRiew = async function (req, res) {
    try{
    let bookIdData = req.params.bookId.trim()

    let reviewIdData = req.params.reviewId.trim()
    let tempData = req.body
    let updateReviewData = {}
    updateReviewData.reviewedBy = tempData.reviewedBy;
    updateReviewData.rating = tempData.rating;
    updateReviewData.review = tempData.review;


    let isValidBookId = mongoose.Types.ObjectId.isValid(bookIdData)

    if (!isValidBookId) { return res.status(400).send({ status: false, message: "Book Id is not correct..." }) }

    let isValidReviewId = mongoose.Types.ObjectId.isValid(reviewIdData)

    if (!isValidReviewId) { return res.status(400).send({ status: false, message: "Review ID is not correct....." }) }

    let BookData = await booksModel.findOne({ _id: bookIdData, isDeleted: false })

    if (!BookData) { return res.status(404).send({ status: false, message: "Book does not exist" }) }

    let reviewData = await reviewModel.findOneAndUpdate({ _id: reviewIdData, isDeleted: false }, { $set: updateReviewData }, { new: true }).select({ __v: 0, isDeleted: 0, createdAt: 0 })

    if (!reviewData) { return res.status(404).send({ status: false, message: "Review does not exist" }) }

    res.status(200).send({ status: true, BookData: BookData, UpdatedReviewData: reviewData })
} catch (err) {
    res.status(500).send(err.message)
}
}

/**************************************End  Review Put Api's😍😊****************************************/
