const crypto = require("crypto")
const User = require("../models/userModel");
const { signToken } = require("../utils/jsonWebToken")
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("./../utils/appError")
const Email = require("./../utils/email")
const { validationResult } = require("express-validator")
const displayValidationErrors = require("./../utils/validationErrors");
const sendResponse = require("../utils/sendResponse");

// signup user handler
exports.signup = asyncHandler(async (req, res, next) => {

    // 1) signup new user
    const { name, email, password, passwordConfirm, role } = req.body

    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
        role,
    })

    // 2) send welcome email
    const url = `${req.protocol}://${req.get("host")}/me`
    await new Email(newUser , url).sendWelcome()

    // 3) generate token
    const token = signToken({ id: newUser._id })

    newUser.password = undefined
    // 4) send response to the client
    sendResponse(res, 201, {
        message: "registered successfully",
        data: {user: newUser},
        token
    })
})

// login user handler
exports.login = asyncHandler(async (req, res, next) => {

    // 1) find user by email
    const { email, password } = req.body
    const user = await User.findOne({ email }).select("+password")
    if (!user) return next(new AppError("Incorrect email or password", 401, "fail"))

    // 2) check password is correct
    const result = await user.checkPassword(password, user.password)
    if (!result) return next(new AppError("Incorrect email or password", 401, "fail"))

    // 3) generate token
    const token = signToken({ id: user._id })

    // 3.5) remove password from output
    user.password = undefined;

    // 4) send response to the client
    sendResponse(res, 200, {
        message: "logged in successfully",
        data: {
            user
        },
        token
    })
})

// logout user handler
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie("jwt", "logout", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    })
    sendResponse(res, 200, {
        status: "success",
        message: "logged out successfully"
    })
})

// forget password handler
exports.forgetPassword = asyncHandler(async (req, res, next) => {

    // 1) find user by email
    const user = await User.findOne({ email: req.body.email })
    if (!user) return next(new AppError("Enter valid email", 401, "fail"))

    // 2) generate && save password reset token in database
    const resetToken = user.createPwdToken()
    await user.save({ validateBeforeSave: false })

    // 3) send PWD reset token to user's email
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`
    await new Email(user, resetUrl).sendPasswordReset()

    // 4) send response to the client
    sendResponse(res, 200, {
        message: "Password Reset Token sent to your email"
    })
})

// reset password handler
exports.resetPassword = asyncHandler(async (req, res, next) => {

    // 1) find user by PWD reset token
    const hashedToken = crypto.createHash("sha256").update(req.params.PWD_token).digest("hex")

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetTokenExpire: { $gt: Date.now() }
    })

    // 2) check if the token has not expired , and there is user, set the new password
    if (!user) return next(new AppError("Invalid token or has expired", 401, "fail"))

    const { password, passwordConfirm } = req.body

    user.password = password
    user.passwordConfirm = passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetTokenExpire = undefined
    await user.save()

    // 3) log the user in , send JWT to the client
    const token = signToken({ id: user._id })

    // 4) send response to the client
    sendResponse(res, 200, {
        message: "password reset successfully",
        token
    })
})


// update current user password
exports.updatePassword = asyncHandler(async (req, res, next) => {

    // 1) get current user
    const user = req.user

    // 2) update user password
    const { oldPassword, newPassword, newPasswordConfirm } = req.body
    // check password is correct
    const result = await user.checkPassword(oldPassword, user.password)
    if (!result) return next(new AppError("Incorrect password", 401, "fail"))

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    await user.save()

    // 3) log user in, send JWT to the client
    const token = signToken({ id: user._id })

    // 4) send response to the client
    sendResponse(res, 200, {
        message: "password updated successfully",
        token
    })
})