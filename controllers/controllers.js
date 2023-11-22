const asyncHandler = require('express-async-handler');
const User = require('../model/usermodel');
const Post= require('../model/postmodel');
const Comment= require('../model/commentmodel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const dotenv = require("dotenv").config();
const cloudinary = require("cloudinary").v2
const util = require('util');
const cloudinaryUpload = util.promisify(cloudinary.uploader.upload);
const uuid = require('uuid');

//****** cloudinary configuration ******
          
cloudinary.config({ 
  cloud_name: 'dqivc0cjo', 
  api_key: '744834123871322', 
  api_secret: '8SbzwigfvVT4tLGVygKXb_IhkBM' 
});


//@desc Home
//@route POST/api/users
//@access public

const Welcome = (req, res) => {
    res.send('Hii, Please login to your account! If you are already registered.. or else please register');
};

//@desc Create register user
//@route POST/api/users
//@access public

const registerUser = asyncHandler(async (req, res, next) => {
        
    try {
        
        const { name, phone, email, password } = req.body;

        
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

    
    const users = await User.find().select('-password').skip(skip).limit(pageSize);

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


//@desc getFriendRequests
//@route POST /api/users/send-friend-request
//@access private

const getFriendRequests = asyncHandler(async (req, res) => {
    let token = req.header('Authorization');

    if (!token) {
        res.status(401);
        throw new Error("Authorization token not provided");
    }

    try {
        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.SECRETKEY);
            const userId = decoded.user.id;
            console.log(userId)
            const user = await User.findById(userId).populate('friendRequestsIn');

            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            const friendRequests = user.friendRequestsIn.map(request => request._id);

            res.status(200).json({ friendRequests });
        }
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid token" });
    }
});



const processFriendRequest = asyncHandler(async (req, res) => {
    let token = req.header('Authorization'); 
    if (!token) {
        res.status(401);
        throw new Error("Authorization token not provided");
    }
    try {
        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1];
            const decoded = jwt.verify(token, process.env.SECRETKEY);
            const userId = decoded.user.id;

            const { action, friendId } = req.body;

            try {
                const foundUser = await User.findById(userId);

                if (!foundUser) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }

                const isAlreadyFriend = foundUser.isFriend.includes(friendId);
                if (isAlreadyFriend) {
                    res.status(400).json({ message: "Already friends" });
                    return;
                }

                if (action === 'accept') {
                    foundUser.isFriend.push(friendId);
                    await foundUser.save();
                }

                foundUser.friendRequestsIn.pull(friendId);
                await foundUser.save();

                res.status(200).json({ message: "Request Accepted" });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid token" });
    }
});

//@desc get newsfeed
//@route GET /api/users/posts
//@access public
const newsfeed = asyncHandler(async (req, res) => {
    try {
        const allUsers = await User.find().populate({
            path: 'posts',
            populate: {
                path: 'comments',
                
            }
        }).populate('friendRequestsIn');

        const usersWithPosts = allUsers.map(user => ({
            name: user.name,
            posts: user.posts.map(post => ({
                Image:post.Image,
                description: post.description,
                comments: post.comments.map(comment => ({
                    text: comment.text,
                    userId: comment.userId ? comment.userId : null,
                })),
            })),
           
        }));

        res.json(usersWithPosts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//@desc CreatPosts
//@route POST /api/users/Creat-Posts
//@access private
const creatpost = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const file = req.files.photo;
    console.log(file)

    try {
        const result = await cloudinaryUpload(file.tempFilePath);

        const { description, enum: enumValue } = req.body;
                
        const post = {
            Image: result.url,
            description,
            comments: []
            };
        
        const createdPost = await Post.create(post);

        if (createdPost) {
            
            const updatedUser = await User.findOneAndUpdate(
                { _id: userId },
                { $push: { posts: createdPost._id } },
                { new: true }
            );

            if (updatedUser) {
                res.status(201).json({ message: "Post Successfully Created", post: createdPost });
            } else {
                res.status(500).json({ message: "Error updating user's posts array" });
            }
        } else {
            res.status(400).json({ message: "Post not created" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//@desc PostComments
//@route POST /api/users/Creat-Posts
//@access private


const PostComments = asyncHandler(async (req, res) => {
    const postId = req.params.id;

    try {
        const { comment } = req.body;

        if (!comment) {
            return res.status(400).json({ message: "Comment is required" });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.type !== 'unrestricted') {
            return res.status(400).json({ message: "Comments not allowed" });
        }

        let token = req.headers.authorization || req.headers.Authorization;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token not provided" });
        }

        const SECRETKEY = process.env.SECRETKEY;

        try {
            if (token && token.startsWith("Bearer")) {
                token = token.split(" ")[1];
                const decoded = jwt.verify(token, SECRETKEY);
                const userId = decoded.user.id;


                const createdComment = await Comment.create({ text: comment, userId });

                if (createdComment) {
                    
                    const updatedPost = await Post.findByIdAndUpdate(
                        postId,
                        { $push: { comments: { text: comment, userId: userId } } },
                        { new: true }
                    ).catch(error => {
                        console.error("Error updating post:", error);
                        return res.status(500).json({ message: "Error updating post" });
                    });

                    if (updatedPost) {
                        return res.status(201).json({ message: "Comment Successfully Created", comment: createdComment });
                    } else {
                        return res.status(500).json({ message: "Error updating post's comments array" });
                    }
                } else {
                    return res.status(400).json({ message: "Comment not created" });
                }
            } else {
                res.status(401);
                throw new Error("User is not authorized");
            }
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


//@desc login
//@route POST/api/login
//@access public
const loggin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("All Fields Are Mandatory");
    }

    try {
        const foundUser = await User.findOne({ email });

        if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
            const accessToken = jwt.sign({
                user: {
                    username: foundUser.username,
                    email: foundUser.email,
                    id: foundUser.id,
                }
            }, process.env.SECRETKEY);
            const userId = foundUser.id;

            res.send(accessToken);
        } else {
            res.status(401);
            throw new Error("Wrong Credentials");
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};





module.exports = { registerUser, getusers, sendFriendRequest,getFriendRequests,processFriendRequest,Welcome,newsfeed,creatpost,PostComments,loggin};
