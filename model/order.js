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
        productId: { type: Schema.Types.ObjectId, ref: 'productUpload' },
        quantity: { type: Number },
    }],
    UserID: { type: Schema.Types.ObjectId },
    Address: {
        name: { type: String },
        addressLine: { type: String },
        city: { type: String },
        pincode: { type: String },
        state: { type: String },
        mobileNumber: { type: Number }
    },
    paymentMethod: { type: String },
    paymentStatus: { type: String },
    CoupenID: { type: Schema.Types.ObjectId },
    TotalPrice: { type: Number },
    OrderDate: { type: Date },
    PaymentId: { type: Number },
});

const order = mongoose.model(process.env.ORDER_COLLECTION, OrderSchema)
module.exports = order