const AppError = require("../utils/appError");

// handle cast errors from mongoose in production
function handleCastError(err) {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400, "fail")
}

// handle duplicate field values from mongoose in production
function handleDuplicateFieldsDB(err) {

    const field = Object.getOwnPropertyNames(err.keyValue)
    const value = err.keyValue[field]

    const message = `Duplicate field "${field}": ${value} , please change it`
    return new AppError(message, 400, "fail")
}

// handle validation errors from mongoose in production
function handleValidationError(err) {
    const errors = Object.values(err.errors).map(el => el.message)

    const message = `Invalid input data: ${errors.join(", ")}`
    return new AppError(message, 400, 'fail')
}

// handle json web token errors in production
function handleJWTError() {
    return new AppError("Invalid Token , please log in again", 401, "fail")
}

// handle json web token expired error in production
function handleJWTExpired() {
    return new AppError("Your token has expired, please log in again!", 401, "fail")
}

// send errors in development environment
function sendErrorDev(err, req, res) {

    // API
    if (req.originalUrl.startsWith("/api")) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    }
    // rendered website
    console.log("ERROR:" , err)
    res.status(err.statusCode).render("error", {
        title: "Something went wrong",
        msg: err.message
    })

}

// send errors in production environment
function sendErrorProd(err, req, res) {

    // API
    if (req.originalUrl.startsWith("/api")) {
        // operational, trusted error: send message to client
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        }
        //  for programming pugs or unknown errors: don't leak error details
        return res.status(500).json({
            status: "error",
            message: "something went wrong"
        })
    }

    // rendered website
    // operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).render("error", {
            title: "Something went wrong",
            msg: err.message
        })
    }
    //  for programming pugs or unknown errors: don't leak error details
    return res.status(500).render("error", {
        title: "Something went wrong",
        msg: "please try again later"
    })

}


module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res)
    } else if (process.env.NODE_ENV = "production") {

        if (err.name === "CastError") err = handleCastError(err)
        if (err.code === 11000) err = handleDuplicateFieldsDB(err)
        if (err.name === "ValidationError") err = handleValidationError(err)
        if (err.name === "JsonWebTokenError") err = handleJWTError()
        if (err.name === "TokenExpiredError") err = handleJWTExpired()

        sendErrorProd(err, req, res)
    }
}