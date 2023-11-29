const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
require('../config/dbconfig')
require('dotenv').config()




const OrderSchema = new mongoose.Schema({

    Status: { type: String },
    Items: [{
        status: {
            type: String,
            default: "Ordered"
        },
        Price: { type: Number },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        quantity: { type: Number },
    }],
    UserID: { type: mongoose.Schema.Types.ObjectId, },
    Address: {
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
    },
    paymentMethod: { type: String },
    paymentStatus: { type: String },
    CoupenID: { type: mongoose.Schema.Types.ObjectId, },
    TotalPrice: { type: Number },
    OrderDate: { type: Date },
    PaymentId: { type: Number },
});

const order = mongoose.model(process.env.ORDER_COLLECTION, OrderSchema)
module.exports = order