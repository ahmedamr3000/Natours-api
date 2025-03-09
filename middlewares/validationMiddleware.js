const Joi = require('joi');
const User = require("./../models/userModel")
const bcrypt = require("bcryptjs")

// const { check } = require("express-validator")

exports.signupSchema = Joi.object({
    name: Joi.string()
        .required()
        .min(2)
        .max(32)
        .messages({
            "any.required": "please enter your name",
            "string.base": "name must be string",
            "string.min": "name must be between 2 and 32 character",
            "string.max": "name must be between 2 and 32 character",
        }),

    email: Joi.string()
        .required()
        .email()
        .external(async (value) => {
            const existingUser = await User.findOne({ email: value });
            if (existingUser) {
                throw new Joi.ValidationError("email is already in use", [
                    {
                        message: "email is already in use",
                        path: ["email"],
                    },
                ]);
            }
        })
        .messages({
            "any.required": "please enter your email",
            "string.email": "Invalid Email",
        }),

    password: Joi.string()
        .required()
        .min(8)
        .pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .messages({
            "any.required": "please enter your password",
            "string.min": "password must be more than 8 character",
            "string.pattern.base": "enter strong password",
        }),

    passwordConfirm: Joi.string()
        .required()
        .valid(Joi.ref('password'))
        .messages({
            "any.required": "please enter password confirm",
            "any.only": "password doesn't match",
        }),
});



// // validation rules for signup new user
// exports.signupRules = [
//     check("name")
//         .notEmpty().withMessage("please enter your name")
//         .isString().withMessage("name must be string")
//         .isLength({ min: 2, max: 32 }).withMessage("name must be between 2 and 32 character"),

//     check("email")
//         .notEmpty().withMessage("please enter your email")
//         .isEmail().withMessage("Invalid Email")
//         .custom(async (val) => { // check if email is unique

//             const existingUser = await User.findOne({ email: val })
//             if (existingUser) {
//                 throw new Error("email is already in use")
//             }

//             return true;
//         }),

//     check("password")
//         .notEmpty().withMessage("please enter your password")
//         .isLength({ min: 8 }).withMessage("password must be more than 8 character")
//         .isStrongPassword().withMessage("enter strong password"),

//     check("passwordConfirm")
//         .notEmpty().withMessage("please enter password confirm")
//         .custom((val, { req }) => {
//             if (val !== req.body.password) throw new Error("password doesn't match")

//             return true;
//         })
// ]


// Define Joi schema
exports.loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .external(async (value, helpers) => {
            // Check if the email exists in the database
            const existingUser = await User.findOne({ email: value }).select("password");
            if (!existingUser) {
                throw new Joi.ValidationError("Incorrect email", [
                    {
                        message: "Incorrect email",
                        path: ["email"],
                    },
                ]);
            }
            // Attach user to context for password validation
            helpers.state.ancestors[0].user = existingUser;
        })
        .messages({
            "any.required": "please enter your email",
            "string.email": "Invalid Email",
        }),

    password: Joi.string()
        .required()
        .external(async (value, helpers) => {
            const user = helpers.state.ancestors[0].user; // Get the user added during email validation
            if (user) {
                const passwordMatch = await bcrypt.compare(value, user.password);
                if (!passwordMatch) {
                    throw new Joi.ValidationError("Incorrect password", [
                        {
                            message: "Incorrect password",
                            path: ["password"],
                        },
                    ]);
                }
            }
        })
        .messages({
            "any.required": "please enter your password",
        }),
});

// // validation rules for user login
// exports.loginRules = [
//     check("email")
//         .notEmpty().withMessage("please enter your email")
//         .isEmail().withMessage("Invalid Email")
//         .custom(async (val, { req }) => {  // check if email exist in database
//             const existingUser = await User.findOne({ email: val }).select("password")

//             if (!existingUser) {
//                 throw new Error("Incorrect email")
//             }

//             req.user = existingUser;
//             return true;
//         }),

//     check("password")
//         .notEmpty().withMessage("please enter your password")
//         .custom(async (val, { req }) => { // check if the password is correct

//             if (req.user) {
//                 const passwordMatch = await bcrypt.compare(val, req.user.password)

//                 if (!passwordMatch) {
//                     throw new Error("Incorrect password")
//                 }

//                 return true;
//             }
//         })
// ]

// // validation rules for forget password
// exports.forgetPasswordRules = [
//     check("email")
//         .notEmpty().withMessage("enter your email")
//         .isEmail().withMessage("Invalid Email")
//         .custom(async (val, { req }) => {
//             const user = await User.findOne({ email: val })

//             if (!user) throw new Error("Invalid Email")

//             return true;
//         })
// ]


// Define Joi schema
exports.forgetPasswordSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .external(async (value) => {
            // Check if the email exists in the database
            const user = await User.findOne({ email: value });
            if (!user) {
                throw new Joi.ValidationError("Invalid Email", [
                    {
                        message: "Invalid Email",
                        path: ["email"],
                    },
                ]);
            }
        })
        .messages({
            "any.required": "enter your email",
            "string.email": "Invalid Email",
        }),
});

// // validation rules for reset password
// exports.resetPasswordRules = [
//     check("password")
//         .notEmpty().withMessage("please enter new password")
//         .isLength({ min: 8 }).withMessage("password must be more than 8 character")
//         .isStrongPassword().withMessage("please enter strong password"),

//     check("passwordConfirm")
//         .notEmpty().withMessage("please enter password confirm")
//         .custom((val, { req }) => {
//             if (val !== req.body.password) throw new Error("password doesn't match")

//             return true;
//         }),

// ]

// Define Joi schema
exports.resetPasswordSchema = Joi.object({
    password: Joi.string()
        .required()
        .min(8)
        .pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .messages({
            "any.required": "please enter new password",
            "string.min": "password must be more than 8 characters",
            "string.pattern.base": "please enter a strong password",
        }),

    passwordConfirm: Joi.string()
        .required()
        .valid(Joi.ref("password"))
        .messages({
            "any.required": "please enter password confirm",
            "any.only": "password doesn't match",
        }),
});

// // validation rules for update current user password
// exports.updatePasswordRules = [
//     check("oldPassword")
//         .notEmpty().withMessage("please enter old password")
//         .custom(async (val, { req }) => { // check if the password is correct

//             if (req.user) {
//                 const passwordMatch = await bcrypt.compare(val, req.user.password)

//                 if (!passwordMatch) throw new Error("Incorrect password")

//                 return true
//             }
//         }),

//     check("newPassword")
//         .notEmpty().withMessage("please enter new password")
//         .isLength({ min: 8 }).withMessage("password must be more than 8 character")
//         .isStrongPassword().withMessage("please enter strong password"),

//     check("newPasswordConfirm")
//         .notEmpty().withMessage("please enter password confirm")
//         .custom((val, { req }) => {

//             if (val !== req.body.newPassword) throw new Error("password doesn't match")

//             return true;
//         })
// ]
// Define Joi schema
exports.updatePasswordSchema = Joi.object({
    oldPassword: Joi.string()
        .required()
        .external(async (value, helpers) => {

            const user = helpers.prefs.context?.user; // Use optional chaining to avoid errors
            // Compare the old password with the user's stored password
            const passwordMatch = await bcrypt.compare(value, user.password);
            if (!passwordMatch) {
                throw new Joi.ValidationError("Incorrect password", [
                    {
                        message: "Incorrect password",
                        path: ["oldPassword"],
                    },
                ]);
            }
        })
        .messages({
            "any.required": "please enter old password",
        }),

    newPassword: Joi.string()
        .required()
        .min(8)
        .pattern(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
        .messages({
            "any.required": "please enter new password",
            "string.min": "password must be more than 8 characters",
            "string.pattern.base": "please enter a strong password",
        }),

    newPasswordConfirm: Joi.string()
        .required()
        .valid(Joi.ref("newPassword"))
        .messages({
            "any.required": "please enter password confirm",
            "any.only": "password doesn't match",
        }),
});

// exports.updateUserRules = [
//     check('email')
//         .optional({ checkFalsy: false })
//         .notEmpty().withMessage("please enter your email")
//         .isEmail().withMessage("please enter valid email")
//         .custom(async (val) => { // check if email is unique

//             const existingUser = await User.findOne({ email: val })

//             if (existingUser) {
//                 throw new Error("email already exist")
//             }
//             return true;
//         }),

//     check("name")
//         .optional({ checkFalsy: false })
//         .notEmpty().withMessage("please enter your name")
//         .isLength({ min: 2, max: 32 }).withMessage("name must be between 2 and 32 character"),

//     check("role")
//         .optional({ checkFalsy: false })
//         .notEmpty().withMessage("please enter your role")
//         .isIn(["user", "admin", "guide", "lead-guide"]).withMessage("role must be one of the following: user, admin, guide, lead-guide")
// ]




exports.updateUserSchema = Joi.object({
    email: Joi.string()
        .email()
        .optional()
        .external(async (value) => {
            // Check if the email already exists in the database
            const existingUser = await User.findOne({ email: value });
            if (existingUser) {
                throw new Joi.ValidationError("email already exists", [
                    {
                        message: "email already exists",
                        path: ["email"],
                    },
                ]);
            }
        })
        .messages({
            "string.email": "please enter a valid email",
        }),

    name: Joi.string()
        .optional()
        .min(2)
        .max(32)
        .messages({
            "string.min": "name must be between 2 and 32 characters",
            "string.max": "name must be between 2 and 32 characters",
        }),

    role: Joi.string()
        .optional()
        .valid("user", "admin", "guide", "lead-guide")
        .messages({
            "any.only": "role must be one of the following: user, admin, guide, lead-guide",
        }),
});


exports.validate = (schema) => {
    return async (req, res, next) => {
        try {
            // Use validateAsync to handle both synchronous and asynchronous validations
            await schema.validateAsync(req.body, { abortEarly: false, context: { user: req.user } });
            next(); // Validation passed, proceed to the next middleware
        } catch (error) {
            if (error.isJoi) {
                // Joi validation errors
                const errors = {};
                for (let err of error.details) {
                    errors[err.path[0]] = err.message;
                }
                return res.status(400).json({
                    status: "fail",
                    message: "validation error",
                    errors,
                });
            }
        }
    };
};