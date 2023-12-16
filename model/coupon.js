const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
require('../config/dbconfig')
require('dotenv').config()



const CouponSchema = new mongoose.Schema({

    CouponName: { type: String },
    Coupon_code: { type: String },
    Min_amount: { type: Number },
    Expirey_date: { type: Date },
    Start_date: { type: Date },
    created: { type: Date },
    IsActive: { type: Boolean },
    DiscountAmount: { type: Number },
});

const coupon = mongoose.model(process.env.COUPON_COLLECTION, CouponSchema)
module.exports = coupon