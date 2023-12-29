const mongoose = require('mongoose')
require('../config/dbconfig')
require('dotenv').config()




const categorySchema = new mongoose.Schema({

    name: { type: String,  unique: true, },
    description: { type: String },
    date: { type: Date },
    categorydiscountprice: { type: Number, default: 0 },
    categorydiscountexpiryDate: { type: Date }, 

});



const category = mongoose.model(process.env.CATEGORY_COLLECTION, categorySchema)
module.exports = category