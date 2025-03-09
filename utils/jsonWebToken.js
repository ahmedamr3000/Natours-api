const jwt = require("jsonwebtoken")


exports.signToken = (parameters) => {
    return jwt.sign(parameters , process.env.JWT_SECRET , {
        expiresIn: process.env.JWT_EXPIRE_IN
    })
}
