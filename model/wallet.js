


const { ObjectId } = require('mongodb');
const mongoose = require('mongoose')
require('../config/dbconfig')
require('dotenv').config()




const WalletSchema = new mongoose.Schema({
    User_id: { type: mongoose.Schema.Types.ObjectId, },
    Account_balance: { type: Number },
    Transactions: [{
        Amount: { type: Number },
        Date: { type: Date },
        Description: { type: String },
        Transaction_type: { type: String },
    }],
});

const wallet = mongoose.model(process.env.WALLET_COLLECTION, WalletSchema)
module.exports = wallet