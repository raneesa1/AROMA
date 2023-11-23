const mongoose = require('mongoose')
require('dotenv').config()

const addresschema = new mongoose.Schema({
    Address: [{
        Addressname: { type: String },
        Firstname: { type: String },
        Secondname: { type: String },
        Address: { type: String },
        PhoneNumber: { type: Number },
        State: { type: String },
        Landmark: { type: String },
        City: { type: String },
        Pincode: { type: String },
        Country: { type: String }
    }]

});

const address = mongoose.model(process.env.ADDRESS_COLLECTION, addresschema)
module.exports = address