const Review = require("./../models/reviewModel")
const sendResponse = require("./../utils/sendResponse")
const asyncHandler = require("./../utils/asyncHandler")
const factory = require("./handlerFactory");

// get all reviews handler
exports.getAllReviews = factory.getAll(Review)
// exports.getAllReviews = asyncHandler(async (req, res, next) => {

    // let filter = {}
    // if (req.params.tourId) filter = { tour: req.params.tourId }

//     const Reviews = await Review.find(filter);

//     sendResponse(res, 200, {
//         result: Reviews.length,
//         data: { Reviews }
//     })
// })

// create review handler
// exports.createReview = asyncHandler(async (req, res, next) => {

//     let { review, rating, tour, user } = req.body
//     if (!tour) tour = req.params.tourId
//     if (!user) user = req.user.id

//     const updateData = { review, rating, tour, user }
//     const newReview = await Review.create(updateData)

//     sendResponse(res, 201, {
//         status: "success",
//         message: "review created successfully",
//         data: {
//             review: newReview
//         }
//     })
// })

exports.setTourUserIds = (req, res, next) => {

    if (!req.body.tour) req.body.tour = req.params.tourId
    if (!req.body.user) req.body.user = req.user.id
    next()
}

exports.getReview = factory.getOne(Review)
exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)