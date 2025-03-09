const express = require('express');
const userController = require('./../controllers/userController');
const authController = require("./../controllers/authController")
// const validation = require("./../middlewares/validationMiddleware");
const { protectRoute } = require('../middlewares/authMiddleware');
const { uploadUserImage, resizeUserImage } = require("./../middlewares/uploadMiddleware");
const { validate, signupSchema, loginSchema, forgetPasswordSchema, resetPasswordSchema, updatePasswordSchema, updateUserSchema } = require('../middlewares/validationMiddleware');

const router = express.Router();

// sign-up new user
router.post(
    "/signup",
    validate(signupSchema),
    authController.signup
)

// login user
/**
 * @swagger
 * /api/v1/users/login:
 *  post:
 *      summary: Log in user
 *      description: API for users to log in
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      required:
 *                          - email
 *                          - password
 *                      properties:
 *                          email: 
 *                              type: string
 *                              example: user@example.com
 *                          password:
 *                              type: string
 *                              example: secret123
 *      responses:
 *          200:
 *              description: Test login API
 *              content: 
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              status: 
 *                                  type: string
 *                                  example: success
 *                              message: 
 *                                  type: string
 *                                  example: logged in successfully
 *                              token: 
 *                                  type: string
 *                                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                              data:
 *                                  type: object
 *                                  properties:
 *                                      user: 
 *                                         $ref: '#/components/schemas/User'
 */
router.post(
    "/login",
    validate(loginSchema),
    authController.login
)
// logout user
router.get(
    "/logout",
    authController.logout
)
// forget password functionality
router.post(
    "/forget-password",
    validate(forgetPasswordSchema),
    authController.forgetPassword
)
// reset user password
router.patch(
    "/reset-password/:PWD_token",
    validate(resetPasswordSchema),
    authController.resetPassword
)

// update user password
router.patch(
    "/update-password",
    protectRoute,
    validate(updatePasswordSchema),
    authController.updatePassword
)
// update user data
router.patch(
    "/updateMe",
    protectRoute,
    uploadUserImage,
    resizeUserImage,
    validate(updateUserSchema),
    // userController.uploadPhoto,
    userController.setUpdateData,
    userController.updateMe
)

// get current logged-in user data
router.get("/me", protectRoute, userController.setUserId, userController.getUser)
// crud operations on user
router
    .route('/')
    .get(userController.getAllUsers)
// .patch( protectRoute , validation.updateUserRules , userController.updateUser)

router
    .route("/:id")
    .get(userController.getUser)
    .delete(protectRoute, userController.deleteUser)
    .patch(protectRoute/* validation.updateUserRules*/, userController.setUpdateData, userController.updateUser)


module.exports = router;
