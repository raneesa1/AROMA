const mongoose=require('mongoose')
require('../config/dbconfig')
require('dotenv').config()

const userSchema=new mongoose.Schema({
    profileImage: {
        type: String, // Store the path to the uploaded image
    },

    name:{
        type:String,
    },
    email:{
        type: String,

    },
    password:{
        type:String,

    },
    phonenumber:{
        type:Number
    },
    Access: {
        type: String,
        enum: [ 'block', 'unblock' ]
    },
    date:{
        type:Date,
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    status: {
    type: Boolean,
    default: false, 
  }
})
const user=mongoose.model(process.env.USER_COLLECTION,userSchema)
module.exports=user