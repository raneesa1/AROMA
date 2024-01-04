const mongoose = require('mongoose')
require('../config/dbconfig')
require('dotenv').config()




const bannerSchema = new mongoose.Schema({

   image: { type: String },
   placement: { type: String },
   status: { type: Boolean, default: false }

});



const banner = mongoose.model(process.env.BANNER_COLLECTION, bannerSchema)
module.exports = banner