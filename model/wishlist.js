


const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
require('../config/dbconfig')
require('dotenv').config()



const WishlistSChema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', required: true
    },
    Product: [{
        Product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },

    }],
})

const wishlist = mongoose.model(process.env.WISHLIST_COLLECTION, WishlistSChema)
module.exports = wishlist