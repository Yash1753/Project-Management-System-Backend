import { User } from "../models/users.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,res,next) => {
    const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ","");
    if(!token){
        throw new ApiError(401,"not authorized");
    }

    try{
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

        if(!user) throw new ApiError(401, "ur token is not valid");

        req.user = user;
        next();

    }catch(err){
        throw new ApiError(401, "ur token is not valid");
    }
})