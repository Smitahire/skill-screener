import prisma from "../database/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const verifyJWT = asyncHandler( async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken ;
        if(!token){
            throw new ApiError(400, "Unauthorised access!")
        }
        
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        const user = await prisma.user.findUnique({
            where: {
                id: decodedToken.id,
            },
            select:{
                id: true,
                userName: true,
                email: true,
                role: true,
                createdAt: true,
            },
        })
        
        if(!user){
            throw new ApiError(500, "Invalid access token!")
        }
    
        req.user = user;

        next()
    } catch (error) {
        next(error);
    }
})

export {verifyJWT}