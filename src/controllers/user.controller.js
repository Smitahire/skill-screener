import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../database/prisma.js";
import { ApiError } from "../utils/ApiError.js";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessToken, generateRefreshToken } from "../utils/Tokens.js";

const options = {
    httpOnly: true,           
    secure: true,
}

const generateAccessAndRefreshToken = async ( user ) => {
    const accessToken =  generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    if(!accessToken || !refreshToken){
        throw new ApiError(500, "Cannot generate access and refresh token !!")
    }
    
    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            refreshToken: refreshToken,
        }
    })
    
    return {accessToken,refreshToken}
}

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
        },
        select: {
            id: true,
            userName: true,
            email: true,
            role: true,
            createdAt: true,
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
        
    //get data and check if givrn correctly
    const { email , password } = req.body

    if(!email || !password){
        throw new ApiError(400, "Incomplete input, please fill all fields")
    }

    // get user
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            userName: true,
            email: true,
            password: true, // needed for bcrypt
            role: true,
            createdAt: true
        },
    })

    if(!user){
        throw new ApiError(404, "user not found")
    }

    //compare password
    const isCorrectPass = await bcrypt.compare(password, user.password)
    if(!isCorrectPass){
        throw new ApiError(400, "Incorrect password!")
    }

    // hide password from user 
    const { password: _pw, ...safeUser } = user;

    // create access and refresh token

    const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user)

    // return response and tokens in cookies
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            safeUser,
            "user logged in!"
        )
    )
})

const logout = asyncHandler( async ( req, res ) => {
    const userID = req.user.id

    const loggedOutUser = await prisma.user.update({
        where: {
            id: userID,
        },
        data: {
            refreshToken: null,
        },
        select: {
            userName: true,
        }
    })
    
    return res
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            loggedOutUser,
            "User Logged out!"
        )
    )

})

export {
    registerUser,
    login,
    logout,
}