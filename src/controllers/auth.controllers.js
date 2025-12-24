import { User } from "../models/users.model.js";
import {ApiResponse} from "../utils/api-response.js"
import {ApiError} from "../utils/api-error.js"
import { asyncHandler } from "../utils/asynchandler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendMail } from "../utils/mail.js";
import { cookie } from "express-validator";
import jwt from "jsonwebtoken"


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
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken",refreshToken, options)
        .json(new ApiResponse(200,{user:loggedInUser,accessToken}, "user logged in successfully"))
    
});


const logoutUser = asyncHandler(async(req,res)=>{
    const id = req.user?._id;
    const user = await User.findByIdAndUpdate(id,{
        $set : {
            refreshToken: null,

        }
    },
    {
        new : true,
    }
    );
     const options = {
        httpOnly : true,
        secure : true,
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user is logged out"));
})

const getCurrUser = asyncHandler(async(req,res) => {
    return res.status(200).json(new ApiResponse(200,req.user,"current user is fetched successfully"))
})

const verifyEmail = asyncHandler(async(req,res) => {
    const {verificationToken}=req.params;
    if(!verificationToken) throw new ApiError(400,"the link for verification is not valid");
    let hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry : {$gt: Date.now()}
    })

    
    if(!user) throw new ApiError(400,"Token is invalid or expired");
    user.emailVerificationToken = undefined
    user.emailVerificationExpiry = undefined
    user.isEmailVerified = true;
    await user.save({validateBeforeSave:false});

    return res.status(200).json(200,{isEmailVerified:true},"user email is verified now")
})

const resendVerificationLogin = asyncHandler(async(req,res) => {
    const user = await User.findById(req.user?._id);
    if(!user) throw new ApiError(400,"user is not loggedIn/exist")
    if(user.isEmailVerified) throw new ApiError(409,"user is already verified");

    const {unhashToken,hashedToken,tokenExpiry} =  user.generateTemporaryTokens();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({validateBeforeSave:false});


    await sendMail({
        email : user?.email,
        subject: "Pls verify ur email",
        mailgenContent : emailVerificationMailgenContent(user.username,`${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashToken}`),


    });

    return res.status(200).json(new ApiResponse(200,{},"mail is sent to mail id"));

})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) throw new ApiError(401,"refresh token is not valid, try to login again now");

    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

    const id = decodedToken?._id;

    const user = await User.findById(id);
    if(!user) throw new ApiError(401,"invalid token");

    //refesh token
    if(incomingRefreshToken !== user.refreshToken) throw new ApiError(401,"refresh token is expired");

    const options = {
        httpOnly : true,
        secure : true
    } 

     const {accessToken, refreshToken : newRefreshToken} = await generateAccessAndRefreshTokens(id);

     user.refreshToken = newRefreshToken;
     await user.save({validateBeforeSave:false});
     
     return res.status(200)
     .cookie("accessToken", accessToken,options)
     .cookie("refreshToken", newRefreshToken,options)
     .json(new ApiResponse(200,{
        accessToken,
        refreshToken : newRefreshToken
     },"new token is generated")
     

    

    );

});

const forgotPasswordRequest = asyncHandler(async(req,res) => {
    const email = req.body;

    const user = await User.findOne({email});
    if(!user) throw new ApiError(400,"user does not exist");

    const {unhashToken,hashedToken,tokenExpiry}  = generateTemporaryTokens();
    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;
    await user.save({validateBeforeSave:false});

    await sendMail({
        email : user?.email,
        subject: "fogot Password",
        mailgenContent : forgotPasswordMailgenContent(user.username,`${process.env.FORGOT_PASSWORD_REDIRECT_URL}`),
    })

    return res.status(200).json(new ApiResponse(200,{},"password reset mail has been sent to your mail"));

})

const resetForgotPassword = asyncHandler(async(req,res) => {
    const {resetToken} = req.params
    const{newPassword} = req.body

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    const user = await User.findOne({
        forgotPasswordToken : hashedToken,
        forgotPasswordExpiry : {$gt : Date.now()}
    })
    if(!user) throw new ApiError(489,"invalid token either expired or wrong");

    user.forgotPasswordExpiry=undefined;
    user.forgotPasswordToken = undefined;
    user.password = newPassword; //it will automaticaaly be hashed due to hoook we used in models before

    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{},"password reset is done"));
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const { oldPassword, newPassword} = req.body;
    const user = User.findById(req.user._id);

    const isValidPassword = await user.isPasswordCorrect(oldPassword);

    if(!isValidPassword) throw new ApiError(400, "invalid user password");

    user.password = newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new ApiResponse(200,{},"password changed successfully"));
})

export {registerUser,login,logoutUser,verifyEmail,resendVerificationLogin,getCurrUser,refreshAccessToken,forgotPasswordRequest,resetForgotPassword,changeCurrentPassword}