import { ApiError, catchAsync } from "./error.middleware";
import jwt from 'jsonwebtoken'


export const isAuthencaticated = catchAsync(async(req,res,next)=>{
    const token = req.cookies.token

    if(!token){
        throw new ApiError("You are not logged in",401)
    }

    try {
        const decoded= jwt.verify(token,process.env.SECRET_KEY);
        req.id = decoded.userId;
        next();
    } catch (error) {
        throw new ApiError("JWT Token Error ",401)
    }
})