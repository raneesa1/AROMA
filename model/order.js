const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2');
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
    UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    orderNumber: { type: String },
    TotalPrice: { type: Number },
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
    OrderDate: { type: Date },
    PaymentId: { type: Number },
});


OrderSchema.plugin(mongoosePaginate);

const order = mongoose.model(process.env.ORDER_COLLECTION, OrderSchema)
module.exports = order