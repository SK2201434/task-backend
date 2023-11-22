const mongoose = require('mongoose');
const CommentSchema = require("../model/commentmodel.js")

const postSchema = mongoose.Schema({
  Image: {
    type: String,
  },
  description: {
    type: String,
    required: [true, "Please add the post text"],
  },
  type: {
    type: String,
    enum: ['restricted', 'unrestricted'],
    default: 'unrestricted',
  },
  comments: [
        {
          text: {
            type: String,
            required: true,
          },
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: 'User',
            required: true,
        },
          
        }
      ]
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);




// const mongoose = require('mongoose');
// const Comment = require('../model/commentmodel');


// const postSchema = mongoose.Schema({
//   Image: {
//     type: String,
//   },
//   description: {
//     type: String,
//     required: [true, "Please add the post text"],
//   },
//   type: {
//     type: String,
//     enum: ['restricted', 'unrestricted'],
//     default: 'unrestricted',
//   },
//   comments: {type: mongoose.Schema.Types.ObjectId,}
//   // [
//     // {
//     //   text: {
//     //     type: String,
//     //     required: true,
//     //   },
      
//     // }
//   // ],
// }, { timestamps: true });

// module.exports = mongoose.model("Post", postSchema);


// postModel.js
// const mongoose = require('mongoose');
// const Comment = require('../model/commentmodel'); // Import the Comment model

// const postSchema = mongoose.Schema({
//   Image: {
//     type: String,
//   },
//   description: {
//     type: String,
//     required: [true, "Please add the post text"],
//   },
//   type: {
//     type: String,
//     enum: ['restricted', 'unrestricted'],
//     default: 'unrestricted',
//   },
//   comments: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Comment', // Reference to the Comment model
//     },
//   ],
// }, { timestamps: true });

// module.exports = mongoose.model('Post', postSchema);

