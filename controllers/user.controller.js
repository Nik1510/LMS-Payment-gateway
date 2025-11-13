import { ApiError, catchAsync } from "../middleware/error.middleware.js";
import {User} from '../models/user.model.js'
import { generateToken } from "../utils/generateToken.js";

export const createUserAccount = catchAsync(async(req,res)=>{
    const {name,email,password,role="student"} = req.body


    // validation can be done globally
    const existingUser = await User.findOne({email:email.toLowerCase()})

    if(existingUser){
        throw new ApiError("User already exists",400);
    }

    const user = await User.create({
        name,
        email:email.toLowerCase(),
        password,
        role
    })
    await user.updateLastActive();
    generateToken(res,user,'Accounted created Successfully');
})


export const authencateuser = catchAsync(async(req,res)=>{
    const {email,password} = req.body;

    const user = User.findOne({email:email.toLowerCase()}).select('+password');

    if(!user || !await user.comparePassword(password)){
        throw new ApiError("Invalid email or password",null)
    }

    await user.updateLastActive();
    generateToken(res,user,`Welcome back ${user.name}`)
})

export const signOutUser = catchAsync(async(_,res)=>{
    res.cookie('token','',{maxAge:0})
    res.status(200).json({
        success:true,
        message:"Signed out successfully"
    });
});


export const getCurrentUserProfile = catchAsync(async(req,res)=>{
    const user = User.findById(req.id)
                    .populate({
                        path:'enrolledCourses.course',
                        select :'title thumbnail description '
                    });
    
    if(!user){
        throw new ApiError("User not found",404)
    }
    res.status(200).json({
        success:true,
        data:{
            ...user.toJSON(),
            totalEnrolledCourses:user.totalEnrolledCourses, // donot execute there => only pass the refence 
        }
    })
})

export const test = catchAsync(async(res,res)=>{
    
})