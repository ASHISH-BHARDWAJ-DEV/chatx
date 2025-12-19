import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";


export const getAllContacts = async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
  
      const filteredUsers = await User.find({
        _id: { $ne: loggedInUserId }
      }).select("-password");
  
      res.status(200).json(filteredUsers);
  
    } catch (error) {
      console.log("Error in getAllContacts:", error);
      res.status(500).json({ message: "Server error" });
    }

};
  

export const getMessagesByUserId = async (req ,res)=>{
    try {
        const myId = req.user._id;
        const {id:usertoChatId} = req.params
         
        const messages = await Message.find({
            $or:[
                {senderId:myId , receiverId:usertoChatId},
                {senderId:usertoChatId, receiverId:myId}
            ],
        });
      res.status(200).json(messages);
    }catch (error){
        console.log("error in getMessagesByUSerId",error.message);
        res.status(500).json({messages:"internal server error"});
    }
      
};


export const sendMessage = async (req, res) => {
    try {
      const {  text, image } = req.body;
      const {id : receiverId} = req.params;
      const senderId = req.user._id;
      if (!senderId || !receiverId) {
        return res.status(400).json({ message: "Sender and Receiver are required" });
      }
      let imageUrl;
      if (image) {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }
      const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
      });
      await newMessage.save();
  
     // todo later for real time meassaging  with sockt io
      return res.status(201).json(newMessage);
  
    } catch (error) {
      console.log("Error in sendMessage:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };
  



  export const getChatPartners = async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
     // all messahes of  user
      const messages = await Message.find({
        $or: [
          { senderId: loggedInUserId },
          { receiverId: loggedInUserId }
        ]
      });
  
      // Extract unique partner ids
      const chatPartnerIds = [
        ...new Set(
          messages.map(msg =>
            msg.senderId.toString() === loggedInUserId.toString()
              ? msg.receiverId.toString()
              : msg.senderId.toString()
          )
        )
      ];
  
      // Fetch partner user details form user colect
      const chatPartners = await User.find({
        _id: { $in: chatPartnerIds }
      }).select("-password");
  
      res.status(200).json(chatPartners);
  
    } catch (error) {
      console.error("Error in getChatPartners:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  