const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Booking must belong to a user"]
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "Booking must belong to a tour"]
    },
    price:{
        type: Number,
        required: [true, "Booking must have a price"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

bookingSchema.pre(/^find/ , function(next){
    this.populate({
        path: "tour",
        select: "name"
    }).populate({
        path: "user",
    })
    next()
})

const BookingModel = mongoose.model("Booking", bookingSchema)

module.exports = BookingModel