const mongoose=require('mongoose')
require('../config/dbconfig')
require('dotenv').config()

const userSchema=new mongoose.Schema({
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
    role:{
        type:String,
        enum:['user']
    },
    status: {
    type: Boolean,
    default: false, 
  }
})
const user=mongoose.model(process.env.USER_COLLECTION,userSchema)
module.exports=user