import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

export const validate = function(req,res,next){
    const err = validationResult(req); //gives an arrray
    if(err.isEmpty()){
        return next();
    }
    const extractedError = [];
    err.array().map((e) => extractedError.push({[e.path] : e.msg}));
    throw new ApiError(402,"received data is not Valid", extractedError);

}