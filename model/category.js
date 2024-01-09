const mongoose = require('mongoose')
require('../config/dbconfig')
require('dotenv').config()




const categorySchema = new mongoose.Schema({

    name: { type: String, unique: true, },
    description: { type: String },
    date: { type: Date },
    categorydiscountper: { type: Number, default: 0 },
    categorydiscountexpiryDate: { type: Date },

});

categorySchema.pre('save', function (next) {
    const currentDate = new Date();

    if (this.categorydiscountexpiryDate && this.categorydiscountexpiryDate <= currentDate) {
        this.categorydiscountper = null;
        this.categorydiscountexpiryDate = null;
    }

    next();
});


const category = mongoose.model(process.env.CATEGORY_COLLECTION, categorySchema)
module.exports = category