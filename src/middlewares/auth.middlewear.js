import prisma from "src/database/prisma";
import { asyncHandler } from "src/utils/asyncHandler";
import jwt from "jsonwebtoken";
import { ApiError } from "src/utils/ApiError";

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
    
        res.user = user;

        next()
    } catch (error) {
        console.log("Error : ", error)
    }
})

export default verifyJWT