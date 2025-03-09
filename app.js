const path = require("path")
const express = require("express")
const setupGlobalMiddleware = require("./middlewares/globalMiddlewares")
const AppError = require('./utils/appError')
const globalErrorMiddleware = require("./middlewares/errorMiddleware")
const tourRouter = require("./routes/tourRouter")
const userRouter = require("./routes/userRouter")
const reviewRouter = require("./routes/reviewRouter")
const viewRouter = require("./routes/viewRouter")
const bookingRouter = require("./routes/bookingRouter")
const swaggerJSDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const tourSchema = require("./schemas/tourSchema")
const userSchema = require("./schemas/userSchema")

const app = express()


const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Natours - Adventure Tours Booking System",
            version: "1.0.0"
        },
        servers: [
            {
                url: "http://localhost:3000"
            }
        ],
        components: {
            schemas: {
                Tour: tourSchema,
                User: userSchema
            }
        }
    },
    apis: [
        './routes/*.js',
    ]
}


const swaggerSpec = swaggerJSDoc(options)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))


// global middlewares
setupGlobalMiddleware(app)

app.set("view engine", "pug")
app.set("views", path.join(__dirname, "views"))

// Routes
app.use("/", viewRouter)
app.use("/api/v1/tours", tourRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/reviews", reviewRouter)
app.use("/api/v1/bookings", bookingRouter)


// unhandled Routes
app.all("*", (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server`, 404, 'fail'));
})

// global error handling middleware
app.use(globalErrorMiddleware)

module.exports = app