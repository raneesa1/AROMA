
const { ObjectId } = require('mongodb');
require('../config/dbconfig')
require('dotenv').config()

const mongoose = require("mongoose"); 

const CartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        },
        products: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
            quantity: { type: Number },
        }],
        active: {
            type: Boolean,
            default: true
        },
        modifiedOn: {
            type: Date,
            default: Date.now
        },
        coupon: { type: Number }
    },

    { timestamps: true }
);
const cart = mongoose.model(process.env.CART_COLLECTION, CartSchema)
module.exports = cart