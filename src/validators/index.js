import { body } from "express-validator";
const userRegisterValidator = ()=>{
    return [
        body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("email is invalid"),

        body("username").trim().notEmpty().withMessage("Username is required")
            .isLowercase("username should be in lowercase").isLength({min : 3}).withMessage("min length shoudl be 3"),
        body("password").trim().notEmpty().withMessage("password can not be empty"),

        body("fullname").optional().trim().notEmpty(),
    ]
}

export {userRegisterValidator};