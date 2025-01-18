import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
    const { fullname, email, password } = req.body;
    try {
        if(!fullname || !email || !password){
            return res.status(400).json({message: "Please fill in all fields"}); //400 -> bad request
        }
        //hash passwords
        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); //1245 => converts to hash

        const newUser = new User({
            fullname,
            email,
            password: hashedPassword
        });

        if(newUser){
            //generate jwt token and send it to the user
            generateToken(newUser._id, res);

            await newUser.save();
            res.status(201).json({_id: newUser._id, fullname: newUser.fullname, email: newUser.email, profilePic: newUser.profilePic});
        }
        else{
            res.status(400).json({message: "Invalid User data -> User not created"});
        }

    } catch (error) {
        console.log(error, "Error in creating user");
        res.status(500).json({message: "Internal server error -> User not created}"});
    }
};

export const login = async (req, res) => {    
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({message: "Please fill in all fields"}); //400 -> bad request
    }
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: "Does not exist"}); //400 -> bad request
        }
        if(user){
            const isMatch = await bcrypt.compare(password, user.password);
            if(isMatch){
                generateToken(user._id, res);
                res.status(200).json({
                    _id: user._id, 
                    fullname: user.fullname, 
                    email: user.email, 
                    profilePic: user.profilePic
                });
            }
            else{
                return res.status(400).json({message: "Invalid credentials"});
            }
        }
    }catch (error) {
        console.log(error, "Error in creating user");
        res.status(500).json({message: "Internal server error -> User not created}"});
        
    }
    
};  

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { //clear the cookie
            httpOnly: true,
            maxAge: 0,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "development",
        });
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        
    }
};  

export const updateProfile = async (req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        
        if(!profilePic){
            return res.status(400).json({message: "Please provide a profile picture"});
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        //cloudinary is not our database its just a storage service/bucket
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true});
        //secure_url is the url of the image stored in cloudinary
        //new: true -> returns the updated document
        res.status(200).json(updatedUser);
    } catch (error) {
        console.log(error, "Error in updating profile");
        res.status(500).json({message: "Internal server error -> Profile not updated}"});
    }
}

export const checkAuth = (req, res) => {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch (error) {
        console.log(error, "Error in checking auth");
        res.status(500).json({message: "Internal server error -> User not found}"});
    }
}