const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
require('../config/dbconfig')
require('dotenv').config()




const ProductSchema = new mongoose.Schema({

  name: { type: String },
  description: { type: String },
  category: { type: ObjectId },
  image: { type: Array },
  date: { type: Date },
  size: [{
    quantity: { type: Number },
    stock: { type: Number }
  }],
  price: { type: Number },
  specification: { type: String },
  status: { type: Boolean, default: false }
});



const product = mongoose.model(process.env.PRODUCT_COLLECTION, ProductSchema)
module.exports = product