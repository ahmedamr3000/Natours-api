const User = require("../models/userModel");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken")


// middleware to prevent unauthorized access to the Route 
exports.protectRoute = asyncHandler(async (req, res, next) => {

    let token;

    // 1) getting token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) return next(new AppError("You are not logged in , please log-in to get access", 401, "fail"))

    // 2) verify token
    const decodedJWT = jwt.verify(token, process.env.JWT_SECRET)


    // 3) check if the user belonging to this token still exist
    const user = await User.findById(decodedJWT.id).select("+password")
    if (!user) return next(new AppError("the User belonging to this token doesn't exist", 401, "fail"))


    // 4) check if user change password after token was issued
    if (user.changedPasswordAfter(decodedJWT.iat)) {
        return next(new AppError("user recently changed password! please log in again.", 401, "fail"))
    }


    // GRANT access to protected route
    req.user = user
    res.locals.user = user
    next()
})

// middleware to check if user is logged in
exports.isLoggedIn = async (req, res, next) => {

    try {

        if (req.cookies.jwt) {

            // 2) verify token
            const decodedJWT = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET)

            // 3) check if the user belonging to this token still exist
            const user = await User.findById(decodedJWT.id)
            if (!user) return next()

            // 4) check if user change password after token was issued
            if (user.changedPasswordAfter(decodedJWT.iat)) return next()

            // GRANT access to protected route
            res.locals.user = user
            return next()
        }
    } catch (err) {
        return next()
    }
    next()
}

// middleware to restrict access permission to the Route
exports.restrictTo = (...roles) => {

    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You don't have permission to do this action", 403, "fail"))
        }

        // GRANT ACCESS TO protected Route
        next()
    }
}