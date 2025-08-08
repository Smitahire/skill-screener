import jwt from "jsonwebtoken";

const generateAccessToken = function ( user ){
    return jwt.sign(
        {
            id: user.id,
            userName: user.userName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const generateRefreshToken = function ( user ) {
    return jwt.sign(
        {
            id: user.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export { generateAccessToken, generateRefreshToken}