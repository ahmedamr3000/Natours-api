const Tour = require('./../models/tourModel');
const ApiFeatures = require("./../utils/apiFeatures")
const asyncHandler = require("./../utils/asyncHandler")
const AppError = require("./../utils/appError");
const sendResponse = require('../utils/sendResponse');
const factory = require("./handlerFactory");

// middleware to select top 5 cheap tours
exports.aliasTopTours = asyncHandler(async (req, res, next) => {
	req.query.limit = 5;
	req.query.sort = "price,-ratingAverage";
	req.query.fields = "name,price,summary,ratingAverage,difficulty";
	next();
})


// get all tours
exports.getAllTours = factory.getAll(Tour)
// exports.getAllTours = asyncHandler(async (req, res, next) => {

// 	// 1) build the query
// 	const features = new ApiFeatures(Tour.find(), req.query)
// 		.filter()
// 		.sort()
// 		.limitFields()
// 		.paginate()

// 	// 2) run the query
// 	const tours = await features.query;

// 	// 3) send response to the client
// 	sendResponse(res, 200, {
// 		result: tours.length,
// 		data: { tours }
// 	})

// });


// get single tour
exports.getTour = factory.getOne(Tour , { path: "reviews" })
// exports.getTour = asyncHandler(async (req, res, next) => {

// 	const tour = await Tour.findById(req.params.id).populate("reviews")
// 	// Tour.findOne({ _id: req.params.id })

// 	if (!tour) {
// 		return next(new AppError("No Tour found with this ID", 404, "fail"))
// 	}

// 	// send response to the client
// 	sendResponse(res, 200, {
// 		data: { tour }
// 	})
// });

// update tour
exports.updateTour = factory.updateOne(Tour)
// exports.updateTour = asyncHandler(async (req, res, next) => {

// 	const UpdatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
// 		new: true,   // to return the updated doc
// 		runValidators: true,  // to run data validators again on update
// 	});

// 	// send response to the client
// 	sendResponse(res, 201, {
// 		message: "tour updated successfully",
// 		data: { tour: UpdatedTour }
// 	})
// });

// delete tour
exports.deleteTour = factory.deleteOne(Tour)
// exports.deleteTour = asyncHandler(async (req, res, next) => {

// 	const tour = await Tour.findByIdAndDelete(req.params.id);

// 	if (!tour) {
// 		return next(new AppError("No Tour found with this ID", 404, "fail"))
// 	}

// 	// send response to the client
// 	sendResponse(res, 204, {
// 		message: "tour deleted successfully"
// 	})

// });


// create new tour
exports.createTour = factory.createOne(Tour)
// exports.createTour = asyncHandler(async (req, res, next) => {

// 	const newTour = await Tour.create(req.body);

// 	// send response to the client
// 	sendResponse(res, 201, {
// 		message: "new tour created successfully",
// 		data: { tour: newTour }
// 	})
// });

// get tours within radius
exports.getToursWithin = asyncHandler(async (req, res, next) => {
	const { distance, lat_lng, unit } = req.params
	const [lat, lng] = lat_lng.split(",")

	const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1

	if(!lat || !lng) {
		next(new AppError("Please provide latitude and longitude in the format lat,lng", 400 , "fail"))
	}

	const tours = await Tour.find({
		startLocation: {
			$geoWithin: {
				$centerSphere: [ [ lng, lat ], radius ] 
			}
		}
	})

	sendResponse(res, 200, {
		status: "success",
		result: tours.length,
		data: {
			docs: tours
		}
	})
})

// get distance of tours between two coordinates
exports.getToursDistance = asyncHandler(async (req, res, next) => {

	const { lat_lng, unit } = req.params
	const [lat, lng] = lat_lng.split(",")

	if(!lat || !lng) {
		next(new AppError("Please provide latitude and longitude in the format lat,lng", 400 , "fail"))
	}

	const distances = await Tour.aggregate([
		{
			$geoNear: {
				near: {
					type: "Point",
					coordinates: [lng * 1, lat * 1]
				},
				distanceField: "distance",
				distanceMultiplier: unit === "mi" ? 0.000621371 : 0.001
			}
		},
		{
			$project: {
				distance: 1,
				name: 1
			}
		}
	])

	sendResponse(res, 200, {
		status: "success",
		data: {
			docs: distances
		}
	})
})

// get tour stats
exports.getTourStats = asyncHandler(async (req, res, next) => {

	const stats = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 } }
		},
		{
			$group: {
				_id: "$difficulty",
				toursNum: { $sum: 1 },
				avgRatings: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				maxPrice: { $max: '$price' },
				minPrice: { $min: '$price' },
			}
		}
	])

	// send response to the client
	sendResponse(res, 200, {
		data: { stats }
	})
});

// get monthly plan per year
exports.getMonthlyPlan = asyncHandler(async (req, res, next) => {

	const year = +req.params.year;

	const plan = await Tour.aggregate([
		{
			$unwind: "$startDates"
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`), // here is a problem with date format
					$lte: new Date(`${year}-21-31`),
				}
			}
		},
		{
			$group: {
				_id: { $month: '$startDates' }, // here is a problem with date format
				toursPerMonth: { $sum: 1 }
			}
		},
		{
			$addFields: { month: "$_id" }
		},
		{
			$project: { _id: 0 }
		},
		{
			$sort: { toursPerMonth: -1 }
		}
	])

	// send response to the client
	sendResponse(res, 200, {
		result: plan.length,
		data: { plan }
	})
});