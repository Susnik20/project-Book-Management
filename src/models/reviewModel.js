const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({

    bookId: {
        type: ObjectId,
        ref: "book",
        required: true
    },
    reviewedBy: {
        type: String,
        required: true,
    },
    reviewedAt: {
        type: Date,
        default: Date.now()
    },
    rating: {
        type: Number,
        minlenght: 1,
        maxlenght: 5,
        required: true

    },

    review: {
        type: String
    },

    isDeleted: {
        type: Boolean,
        default: false

    }
}, { timestamps: true });

module.exports = mongoose.model("bookreview", reviewSchema)









