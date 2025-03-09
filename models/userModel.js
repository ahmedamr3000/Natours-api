const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
        minLength: [2, "name must be more than 2 characters"],
        maxLength: [32, "name must be less than 32 characters"],
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: {
            validator: function (val) {
                let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(val)
            },
            message: "Invalid Email"
        }
    },
    role: {
        type: String,
        enum: ["user", "guide", "lead-guide", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, 'Please enter your password'],
        minLength: [8, "password must be more than 8 character"],
        select: false
    },
    passwordConfirm: {  // only for validation , only work on create() , save()
        type: String,
        required: true,
        minLength: [8, "password must be more than 8 character"],
        validate: {
            validator: function (val) {
                return this.password === val
            },
            message: "password doesn't match"
        }
    },
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
    photo: {
        type: String,
        default: 'default.jpg'
    },
    passwordChangedAt: Date
})

// hashing password before save in database
userSchema.pre('save', async function (next) {
    if (!this.isModified("password")) return next(); // run this if only password isn't modified

    this.password = await bcrypt.hash(this.password, 10)  // hash password
    this.passwordConfirm = undefined; // delete passwordConfirm field
    next();
})

// update passwordChangedAt property when update password
userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now()
    next()
})


// check password is correct when login
userSchema.methods.checkPassword = async function (inputPassword, userPassword) {

    return await bcrypt.compare(inputPassword, userPassword)
}

// check if the password changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {

    if (this.passwordChangedAt) {
        const passwordTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000)
        return passwordTimestamp > JWTTimestamp
    }
    return false;
}

// generate && save password reset token in database
userSchema.methods.createPwdToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex")

    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex") // hash password Token 
    this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    return resetToken;
}

const userModel = mongoose.model('User', userSchema)
module.exports = userModel