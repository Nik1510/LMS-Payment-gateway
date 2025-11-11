import {v2 as cloudinary} from 'cloudinary'
import dotenv from "dotenv"

dotenv.config({})

cloudinary.config({
    api_key : process.env.api_key,
    api_secret: process.env.API_SECRET,
    cloud_name : process.env.CLOUD_NAME
});

export const uploadMedia= async(file)=>{
    try {
        const uploadResponse = await cloudinary.uploader.upload(file,{
            resource_type:'auto'
        })
        return uploadResponse;
    } catch (error) {
        console.log("Error while uploading media to cloudinary")
        console.log(error)
    }
}

export const deleteMediaFromCloudinary = async(publicId)=>{
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.log("Failed to delete MEDIA from Cloudinary")
        console.log(error)
    }
}

export const deleteVideoFromCloudinary = async(publicId)=>{
    try {
        await cloudinary.uploader.destroy(publicId,{resource_type:"video"})
    } catch (error) {
        console.log("Failed to delete MEDIA from Cloudinary")
        console.log(error)
    }
}