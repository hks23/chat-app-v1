import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        // console.log("Token from cookies:", req.cookies.jwt);
        if(!token){
            return res.status(401).json({message: "Unauthorized access -> No token provided"}); //401 -> unauthorized
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // console.log("Decoded token:", decoded);
        if(!decoded){
            return res.status(401).json({message: "Unauthorized Invalid Token"});
        }
        const user = await User.findById(decoded.id).select("-password"); //exclude password
        console.log("User found:", user);
        if(!user){
            return res.status(404).json({message: "Unauthorized access -> No user found"}); //401 -> unauthorized
        }
        req.user = user;
        next(); //move to the next middleware

    } catch (error) {     
        console.log("Error in protectRoute middleware", error);         
        return res.status(401).json({message: "Unauthorized access"});
    }   
}