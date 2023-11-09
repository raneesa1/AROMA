const mongoose=require('mongoose')
require('../config/dbconfig')
require('dotenv').config()




const ProductSchema = new mongoose.Schema({
 
  name: { type: String },
 description: { type: String },
  category: {type:String},
  image: {type:Array},
   date:{type:Date},
  stock: { type: Number },
  price: { type: Number },
  specification:{type:Array}
});



const product=mongoose.model(process.env.PRODUCT_COLLECTION,ProductSchema)
module.exports=product