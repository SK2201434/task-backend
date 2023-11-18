const asyncHandler = require('express-async-handler');
const User = require("../model/usermodel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv").config();
const cloudinary = require("cloudinary").v2
const util = require('util');
const cloudinaryUpload = util.promisify(cloudinary.uploader.upload);
// import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'dqivc0cjo', 
  api_key: '744834123871322', 
  api_secret: '8SbzwigfvVT4tLGVygKXb_IhkBM' 
});

//@desc Create register user
//@route POST/api/users
//@access public
const Welcome = (req, res) => {
    res.send('Hii login to see your friend requests');
};






const registerUser = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    const file = req.files.photo;

    try {
        const result = await cloudinaryUpload(file.tempFilePath);

        console.log(result);

        const { name, phone, email, password } = req.body;

        // Check if all required fields are present
        if (!name || !phone || !email || !password) {
            res.status(400);
            throw new Error('All fields are mandatory');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
            name,
            phone,
            email,
            password: hashedPassword,
            ImagePath: result.url,
        };

        const createdUser = await User.create(user);

        if (createdUser) {
            res.status(201).json({ message: "User Successfully Created" });
        } else {
            res.status(400).json({ message: "User not created" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});







//@desc Find all users
//@route GET /api/users
//@access public
const getusers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const pageSize = parseInt(req.query.pageSize) || 2; 
    const skip = (page - 1) * pageSize;

    
    const users = await User.find().skip(skip).limit(pageSize);

    res.status(200).json({ users, currentPage: page, pageSize });
});


//@desc Send friend request
//@route POST /api/users/send-friend-request
//@access public
const sendFriendRequest = asyncHandler(async (req, res) => {
    const { userId, friendId } = req.body;

    if (!userId || !friendId) {
        res.status(400).json({ message: "Both userId and friendId are required" });
        return;
    }

    try {
        const userExists = await User.exists({ _id: userId });
        const friendExists = await User.exists({ _id: friendId });

        if (!userExists || !friendExists) {
            res.status(400).json({ message: "Invalid userId or friendId" });
            return;
        }

        
        const updateUser = await User.findByIdAndUpdate(
            friendId,
            { $addToSet: { friendRequestsIn: userId } },
            { new: true }
        );
            console.log(updateUser)
        if (updateUser) {
           
            res.status(200).json({ message: "Friend request sent successfully" });
        } else {
            res.status(400).json({ message: "Failed to update user" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const getFriendRequests = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("All Fields Are Mandatory");
    }

    // Use a different variable name to avoid conflicts
    const foundUser = await User.findOne({ email });

    if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
        const accessToken = jwt.sign({
            user: {
                username: foundUser.username,
                email: foundUser.email,
                id: foundUser.id,
            }
        }, process.env.SECERETKEY);

        // res.status(200).json({ accessToken });

       

        const userId = foundUser.id;
        console.log(userId)
        try {
            const user = await User.findById(userId).populate('friendRequestsIn');

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            res.status(200).json(user.friendRequestsIn);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        res.status(401);
        throw new Error("Wrong Credentials");
    }
});



const processFriendRequest = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const { action, friendId } = req.body;
    console.log(friendId)
    try {
        const updateUser = await User.findByIdAndUpdate(
            userId,
            { $pull: { friendRequestsIn: friendId } }, 
            { new: true }
        );

        console.log(updateUser);

        if (!updateUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isAlreadyFriend = updateUser.isFriend.includes(friendId);
        if (isAlreadyFriend) {
            res.status(400).json({ message: "Already friends" });
            return;
        }
        if (action === 'accept') {
            updateUser.isFriend.push(friendId);
            await updateUser.save();
        }

        res.status(200).json({ message: "Request Accepted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
const userlogin = asyncHandler(async(req,res)=>{
res.status(200).json({message: "Hii "})
});








module.exports = { registerUser, getusers, sendFriendRequest,getFriendRequests,processFriendRequest,Welcome};
