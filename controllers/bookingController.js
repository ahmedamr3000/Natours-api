const asyncHandler = require("./../utils/asyncHandler");
const Tour = require("./../models/tourModel");
const User = require("./../models/userModel");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const Booking = require("./../models/bookingModel");
const sendResponse = require("./../utils/sendResponse");
const factory = require("./handlerFactory");

exports.getCheckoutSession = asyncHandler(async (req, res, next) => {

    // 1) get the currently booked tour
    const { tourId } = req.params
    const tour = await Tour.findById(tourId)

    // 2) create checkout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        // success_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${req.user.id}&price=${tour.price}`, // for testing
        success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: tourId,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [`https://tours-booking.cyclic.app/img/tours/${tour.imageCover}`],
                    },
                },
                quantity: 1
            }
        ],
        mode: 'payment'
    })

    // 3) create session as response
    sendResponse(res, 200, {
        data: { session }
    })
})

// exports.createBookingCheckout = asyncHandler(async (req, res, next) => {

//     // this is only temp
//     const { tour, user, price } = req.query

//     if (!tour || !user || !price) return next()
//     await Booking.create({ tour, user, price })

//     res.redirect("/")
// })

const createBooking = async session => {
    const tour = session.client_reference_id
    const user = (await User.findOne({ email: session.customer_email })).id
    const price = session.amount_total / 100

    await Booking.create({ tour, user, price })
}

exports.webhookCheckout = (req, res, next) => {

    const signature = req.headers['stripe-signature']

    let event
    try {
        event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
        console.log("error", err)
        return res.status(400).send(`Webhook error: ${err.message}`)
    }

    if (event.type === 'checkout.session.completed') {
        createBooking(event.data.object)
    }

    res.status(200).json({
        received: true
    })
}

exports.getAllBookings = factory.getAll(Booking)