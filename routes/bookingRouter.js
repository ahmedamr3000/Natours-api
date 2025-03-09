const express = require('express')
const { protectRoute ,restrictTo } = require('../middlewares/authMiddleware')
const bookingController = require("./../controllers/bookingController")

const router = express.Router()

router.get(
    "/checkout-session/:tourId",
    protectRoute,
    bookingController.getCheckoutSession
    )

router.get("/" , protectRoute , restrictTo("admin" , "lead-guide") ,bookingController.getAllBookings)

module.exports = router