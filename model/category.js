const mongoose=require('mongoose')
require('../config/dbconfig')
require('dotenv').config()




const categorySchema = new mongoose.Schema({
 
name: { type: String },
description: { type: String },

date:{type:Date},

});



const category=mongoose.model(process.env.CATEGORY_COLLECTION,categorySchema)
module.exports=category