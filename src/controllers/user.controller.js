import { asyncHandler } from "src/utils/asyncHandler.js";
import prisma from "src/database/prisma.js";
import { ApiError } from "src/utils/ApiError";
import bcrypt from "bcrypt";
import { ApiResponse } from "src/utils/ApiResponse";



const registerUser = asyncHandler( async ( req, res ) => {

    const { userName, email, password, role = "APPLICANT"} = req.body

    // check is all fiels are there
    if(!userName || !email || ! password ){
        throw new ApiError(400, "Incomplete Information, please give all fields!")
    }

    // duplicate mail or not
    const existingUser = await prisma.user.findUnique({
        where: { email },
    })
    if(existingUser)throw new ApiError(400, "User alredy exists!"); 

    // hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // create user
    const createdUser = await prisma.user.create({
        data : {
            userName,
            email,
            password: hashedPassword,
            role
        }
    })

    // return response
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            createdUser,
            "user created successfully!"
        )
    )

})

const login = asyncHandler( async ( req, res ) => {

})

const logout = asyncHandler( async ( req, res ) => {
    
})