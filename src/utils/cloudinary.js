import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,
            {
                resource_type: "auto",
            }
        )
        fs.unlinkSync(localFilePath)
        //file has been uploaded suscessfully
        //console.log("file is uploaded on cloudinary ", response.url);
        //console.log("Responce after cloudinary uploaded : ", response);
        
        return response;
        
    } catch (error) {
        console.error("Cloudinary upload failed:", error.message);

        fs.unlinkSync(localFilePath) // remove the locally saved temp file as the upload opration got failled
        return null 
    }
}

export {uploadOnCloudinary}


