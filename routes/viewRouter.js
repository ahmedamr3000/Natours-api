const express = require("express")
const viewsController = require("../controllers/viewsController")
const { protectRoute, isLoggedIn } = require("../middlewares/authMiddleware")
const bookingController = require("../controllers/bookingController")

const router = express.Router()

// router.use(isLoggedIn)
router.use(viewsController.alerts)

router.get("/", isLoggedIn, viewsController.getOverview)
router.get("/tour/:slug", isLoggedIn, viewsController.getTour)
router.get("/login", isLoggedIn, viewsController.getLoginForm)
router.get("/me", protectRoute, viewsController.getAccount)
router.get("/my-tours", protectRoute, viewsController.getMyTours)
router.post("/submit-user-data", protectRoute, viewsController.updateUserData)

module.exports = router