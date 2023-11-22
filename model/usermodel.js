const mongoose = require('mongoose');
const PostSchema = require('../model/postmodel');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add the name"],
  },
  phone: {
    type: Number,
    required: [true, "Please add the contact phone number"],
  },
  email: {
    type: String,
    required: [true, "Please add email"],
  },
  password: {
    type: String,
    required: [true, "Please add email"],
  },
  isFriend: {
    type: Array,
    default: null,
  },
  ImagePath: {
    type: String,
  },
  friendRequestsIn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }], 
}, { timestamps: true });

const User = mongoose.model('User', userSchema); // Fix: Separate the model name and schema
module.exports = User;
