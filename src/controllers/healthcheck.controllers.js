import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/asynchandler.js";
/* const healthCheck = (req,res,next)=>{
    try{
        res.status(200);
       return res.json(new ApiResponse(200,{message : "server is running"}))
    }catch(error){
        next(error);
    }
} */
const healthCheck = asyncHandler(async(req,res) => {
    return res.status(200).json(new ApiResponse(200,{message : "server is running"}))
})

export {healthCheck}