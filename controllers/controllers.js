const asyncHandler = require('express-async-handler');
const User = require("../model/usermodel");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv").config();
// const multer = require("multer");
// const path = require("path");
// const fs = require('fs').promises;


//@desc Create register user
//@route POST/api/users
//@access public
const Welcome = (req, res) => {
    res.send('Hii login to see your friend requests');
};


// Multer storage configuration
// const fs = require('fs').promises;


// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './upload/images'); // specify the destination folder for uploaded files
//     },
//     filename: function (req, file, cb) {
//         // generate a unique filename for the uploaded file
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });



const registerUser = asyncHandler(async (req, res) => {
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
    };

    
    const createdUser = await User.create(user);

    if (createdUser) {
        res.status(201).json({ message: "User Successfully Created" });
    } else {
        res.status(400).json({ message: "User not created" });
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
