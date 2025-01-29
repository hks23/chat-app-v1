import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";


export const getUserSideBar = async (req, res) => {

    try {
        const loggedInUser = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUser}}).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getUserSideBar", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const getMessages = async (req, res) => {
    try {
        const {id:userToChatId } = req.params;
        const myID = req.user._id;
        const messages = await Message.find({
            $or: [
                {senderID: myID, receiverID:userToChatId},
                {senderID: userToChatId, receiverID: myID},
            ]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};

export const sendMessage = async (req, res) => {
    try {
        const {id: receiverID} = req.params;
        const {text, media} = req.body;
        const senderID = req.user._id;

        let mediaUrl;
        if(media){
            //upload image to cloudinary
            const uplaodResponse = await cloudinary.uploader.upload(media);
            mediaUrl = uplaodResponse.secure_url;
        }
        const newMessage = new Message({senderID, receiverID, text, media: mediaUrl});
        await newMessage.save();
        //TODO =>socket.io
        const receiverSocketId = getReceiverSocketId(receiverID);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", newMessage);
        }
        
        res.status(200).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage", error.message);
        res.status(500).json({message: "Internal server error"});
    }
};