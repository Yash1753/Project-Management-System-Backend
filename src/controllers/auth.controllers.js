import { User } from "../models/users.model.js";
import {ApiResponse} from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/asynchandler.js";
import { emailVerificationMailgenContent, sendMail } from "../utils/mail.js";


const generateAccessAndRefreshTokens = async(_id)=>{
    try{
        const user = await User.findById(_id);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});
        return {refreshToken, accessToken};
    }catch(err){
        throw new ApiError(500,"something went during token generation",[]);
    }
}

const registerUser = asyncHandler(async (req,res) => {
    const {email, password, username,role} = req.body;

    const existUser = await User.findOne({
        $or : [{username}, {email}],
    })

    if(existUser) throw new ApiError(409,"user with email or username already exits",[]);

    const user = await User.create({
        email,password,username,
        isEmailVerified : false,
    });

    const {unhashToken,hashedToken,tokenExpiry} =  user.generateTemporaryTokens();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({validateBeforeSave:false});


    await sendMail({
        email : user?.email,
        subject: "Pls verify ur email",
        mailgenContent : emailVerificationMailgenContent(user.username,`${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashToken}`),


    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    if(!createdUser) throw new ApiError(500, "something went worng while registering user")

        return res.status(201).json(
            new ApiResponse(
                200,
                {user : createdUser},
                "User registed and Verification email has been sent on email"

            )
        )

})


export {registerUser}