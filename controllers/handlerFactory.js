const AppError = require("./../utils/appError")
const sendResponse = require("./../utils/sendResponse")
const asyncHandler = require("./../utils/asyncHandler")
const displayValidationErrors = require("../utils/validationErrors");
const { validationResult } = require("express-validator");
const ApiFeatures = require("./../utils/apiFeatures")

// factory get all
exports.getAll = Model => asyncHandler(async (req, res, next) => {

    //  to allow for nested GET reviews on specific tour ( /tours/:tourId/reviews)
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    // 1) build the query
    const features = new ApiFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate()

    // 2) run the query
    const docs = await features.query;
    // const docs = await features.query.explain();

    // 3) send response to the client
    sendResponse(res, 200, {
        result: docs.length,
        data: { docs }
    })

})

// factory get
exports.getOne = (Model, popOptions) => asyncHandler(async (req, res, next) => {

    let query = Model.findById(req.params.id);

    if (popOptions) query = query.populate(popOptions);

    const doc = await query;
    // Tour.findOne({ _id: req.params.id })

    if (!doc) {
        return next(new AppError("No document found with this ID", 404, "fail"))
    }

    // send response to the client
    sendResponse(res, 200, {
        status: "success",
        data: { doc }
    })
})


// factory delete
exports.deleteOne = Model => asyncHandler(async (req, res, next) => {

    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
        return next(new AppError("No document found with this ID", 404, "fail"))
    }

    // send response to the client
    sendResponse(res, 204, {
        status: "success",
        message: "document deleted successfully",
        data: null
    })

})

// factory create 
exports.createOne = Model => asyncHandler(async (req, res, next) => {

    const newDoc = await Model.create(req.body);

    sendResponse(res, 201, {
        status: "success",
        message: "new document created successfully",
        data: {
            newDoc
        }
    })
})

// factory update
exports.updateOne = (Model) => asyncHandler(async (req, res, next) => {

    // 1)  check if there is errors from express-validator
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return displayValidationErrors(errors, res)
    }

    const updateData = req.updateData ? req.updateData : req.body
    const UpdatedDoc = await Model.findByIdAndUpdate(req.params.id, updateData, {
        new: true,   // to return the updated doc
        runValidators: true,  // to run data validators again on update
    });

    // send response to the client
    sendResponse(res, 201, {
        status: "success",
        message: "document updated successfully",
        data: {
            UpdatedDoc
        }
    })
})