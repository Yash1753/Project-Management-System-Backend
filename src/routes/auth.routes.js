import express from "express";
import {changeCurrentPassword, forgotPasswordRequest, getCurrUser, login, logoutUser, refreshAccessToken, registerUser, resendVerificationLogin, resetForgotPassword, verifyEmail} from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/validator.middleware.js";
import { userForgotPasswordValidator, userRegisterValidator, userResetForgotPassword } from "../validators/index.js";
import {loginValidator} from "../validators/index.js"
import { verifyJWT} from "../middlewares/auth.middleware.js"
const router  = express.Router();

router.route("/register").post(userRegisterValidator(),validate,registerUser)
router.route("/login").post(loginValidator(),validate,login)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token/").post(refreshAccessToken)
router.route("/forgot-password").get( userForgotPasswordValidator(),validate ,forgotPasswordRequest)
router.route("/reset-password/:resetToken").post(userResetForgotPassword(),validate,resetForgotPassword)



//secured routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/current-user").post(verifyJWT,getCurrUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/resend-email-verification").post(verifyJWT,resendVerificationLogin)



export default router;