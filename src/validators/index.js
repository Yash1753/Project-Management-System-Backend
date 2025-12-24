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
const loginValidator = ()=>{
    return [
         body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("email is invalid"),
         body("password").trim().notEmpty().withMessage("password can not be empty"),
    ]
}

const userChangeCurrentPasswordValidator = () =>{
    return [
        body("oldPassword").notEmpty().withMessage("Old password is requried"),
        body("newPassword").notEmpty().withMessage("New password is requried"),
    ]
}

const userForgotPasswordValidator = () =>{
    return [
         body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("email is invalid"),

    ]
}

const userResetForgotPassword = ()=>{
    return [
        body("newPassword").notEmpty().withMessage("New password is requried"),
    ]
}

export {userRegisterValidator,loginValidator,userChangeCurrentPasswordValidator,userForgotPasswordValidator,userResetForgotPassword};
