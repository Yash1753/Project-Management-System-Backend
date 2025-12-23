import { User } from "../models/users.model.js";
import {ApiResponse} from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/asynchandler.js";
import { emailVerificationMailgenContent, sendMail } from "../utils/mail.js";
import { cookie } from "express-validator";


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

});

const login = asyncHandler(async function(req,res){
    const {email,password} = req.body;
    if(!email) throw new ApiError(400,"email is required",[]);

    //find user

    const user = await User.findOne({
        email
    });

    if(!user) throw new ApiError(400,"user does not exist",[]);

    const validPass = await user.isPasswordCorrect(password);
    if(!validPass) throw new ApiError(400,"invalid creditianls",[]);

   const{refreshToken, accessToken}  =  await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    //if(!loggedInUser) throw new ApiError(500, "something went worng while loggin user")

    const options = {
        httpOnly : true,
        secure : true,
    }

    return res.status(200)
        .cookie("access_Token", accessToken, options)
        .cookie("Refresh_token",refreshToken, options)
        .json(new ApiResponse(200,{user:loggedInUser,accessToken}, "user logged in successfully"))
    
})


export {registerUser,login}