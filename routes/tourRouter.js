const express = require('express');
const tourController = require('./../controllers/tourController');
const { protectRoute, restrictTo } = require("./../middlewares/authMiddleware")
const { resizeTourImages, uploadTourImages } = require("./../middlewares/uploadMiddleware")
const reviewRouter = require("./reviewRouter")

const router = express.Router();



// param middleware
// router.param('id', tourController.checkId); 

router.use("/:tourId/reviews", reviewRouter)

// get top five cheapest tours
router
    .route("/top-5-cheap")
    .get(tourController.aliasTopTours, tourController.getAllTours)

// get monthly plan per year 
router
    .route("/monthly-plan/:year")
    .get(protectRoute, restrictTo("admin", "lead-guide", "guide"), tourController.getMonthlyPlan)

// get tour stats
router
    .route("/tours-stats")
    .get(tourController.getTourStats)

// geo-spatial queries: tours within certain distance of certain coordinates
router.route("/tours-within/:distance/center/:lat_lng/unit/:unit").get(tourController.getToursWithin)

// get distance of tours between two coordinates
router.route("/tours-distance/:lat_lng/unit/:unit").get(tourController.getToursDistance)

/**
 * @swagger
 * /api/v1/tours:
 *  get:
 *      summary: Get all Tours
 *      description: this is api for getting all Tours data
 *      responses: 
 *          200:
 *              description: test get all tours data
 */
// CRUD operations on tours
router
    .route('/')
    .get(tourController.getAllTours)
    .post(protectRoute, restrictTo("admin", "lead-guide"), tourController.createTour);

/**
 * @swagger
 * /api/v1/tours/{id}:
 *  get:
 *      summary: Get single Tour by ID 
 *      description: this is api for getting tour data by ID
 *      parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: Tour ID
 *            schema:
 *                type: string
 *      responses: 
 *          200:
 *              description: test get tour data
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status:
 *                                  type: string
 *                                  example: success
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      doc:
 *                                         $ref: '#components/schemas/Tour'
 */
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        protectRoute,
        restrictTo("admin", "lead-guide"),
        uploadTourImages,
        resizeTourImages,
        tourController.updateTour
    )
    .delete(protectRoute, restrictTo("admin", "lead-guide"), tourController.deleteTour);


module.exports = router;
