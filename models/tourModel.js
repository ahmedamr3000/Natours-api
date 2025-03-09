const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator")
// const User = require("./userModel")

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'tour name is required'],
        unique: true,
        trim: true,
        minLength: [10, "tour must have more than 10 char"],
        // validate: [validator.isAlpha , 'Tour name must be string']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'tour must have duration'],
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'tour must have a group size'],
    },
    difficulty: {
        type: String,
        required: [true, 'tour must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: "Difficulty is either: easy, medium, difficult"
        }
    },
    price: {
        type: Number,
        required: [true, 'tour price is required'],
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price // this keyword points to current doc on new doc creation but not work on update
            },
            message: "Discount price ({VALUE}) should be lower than price"
        }
    },
    summary: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'tour must have description'],
    },
    imageCover: {
        type: String,
        required: [true, 'tour must have image'],
    },
    images: {
        type: [String],
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'rating must be above 1.0'],
        max: [5, 'rating must be below 5.0'],
        set: val => parseFloat(val.toFixed(1))
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [String],
    secret: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ]
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


tourSchema.index({ price: 1 , ratingsAverage: -1 })
tourSchema.index({ slug: 1 })
tourSchema.index({ startLocation: '2dsphere' })

tourSchema.virtual('durationInWeeks').get(function () {
    return this.duration / 7;
})

tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
})

// document middleware that runs before .save() .create() but not .update()
tourSchema.pre('save', function (next) {  // this func has access to current document 
    this.slug = slugify(this.name, { lower: true });
    next();
})

// tourSchema.pre('save' , async function(next) {
//     const guidesPromises = this.guides.map( async id => await User.findById(id))
//     this.guides = await Promise.all(this.guidesPromises)

//     next()
// })

// another pre save hook
// tourSchema.pre('save', function (next) {
//     console.log("will save doc.....")
//     next();
// })

// post save hook
// tourSchema.post("save" , function(doc , next) {
//     console.log(doc)
//     next();
// })


// query middleware
tourSchema.pre(/^find/, function (next) {
    this.find({ secret: { $ne: true } })
    next();
})

tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -password -passwordChangedAt'
    })
    next();
})
// tourSchema.post(/^find/ , function(docs , next) {
//     console.log(docs)
//     next();
// })


// aggregation middleware
tourSchema.pre('aggregate', function (next) {
    this.pipeline().push({ $match: { secret: { $ne: true } } })
    next();
})


const tourModel = mongoose.model('Tour', tourSchema);

module.exports = tourModel;
