const mongoose=require('mongoose')
require('../config/dbconfig')
require('dotenv').config()

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type:String,
        required:true

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
})
const user=mongoose.model(process.env.USER_COLLECTION,userSchema)
module.exports=user