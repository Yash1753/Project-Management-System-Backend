import express from "express";
import {login, registerUser} from "../controllers/auth.controllers.js"
import { validate } from "../middlewares/validator.middleware.js";
import { userRegisterValidator } from "../validators/index.js";
import {loginValidator} from "../validators/index.js"
const router  = express.Router();

router.route("/register").post(userRegisterValidator(),validate,registerUser)
router.route("/login").post(loginValidator(),validate,login)


export default router;