const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please add the name"],
    },
    
    phone:{
        type: Number,
        required: [true, "Please add the contact phone number"],
    },
    email:{
        type: String,
        required: [true, "Please add email"],
    },
    password:{
        type: String,
        required: [true, "Please add email"],
    },
    isFriend: {
        type: Array,
        default: null,
    },
    ImagePath:{
        type:String,
    },
    friendRequestsIn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    
    },{timestamp:true
    });

    module.exports= mongoose.model("User",userSchema)
