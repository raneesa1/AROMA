const mongoose=require('mongoose')
require('../config/dbconfig')
require('dotenv').config()




const categorySchema = new mongoose.Schema({
 
name: { type: String },
description: { type: String },
image: {type:String},
date:{type:Date},
stock: { type: Number }

});



const category=mongoose.model(process.env.CATEGORY_COLLECTION,categorySchema)
module.exports=category