const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
require('../config/dbconfig')
require('dotenv').config()



const ReturnSchema = new mongoose.Schema({
    userId: {
        type: ObjectId,
        required: true,
    },
    orderId: {
        type: ObjectId,
    },
    Status: {
        type: String,
        default: "not accepted"
    },
    product: {
        type: ObjectId,
    },
    quantity: { type: Number },
    reason: {
        type: String,
    },
    price: {
        type: Number,
    },
    returnedDate: {
        type: Date,
    },
    orderDate: {
        type: Date,
    },
});


const returns = mongoose.model(process.env.RETURNS_COLLECTION, ReturnSchema)
module.exports = returns