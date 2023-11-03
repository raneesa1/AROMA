const mongoose=require('mongoose')
require('dotenv').config()

const OtpSchema = new mongoose.Schema({
  Otp: { type: String, required: true },
  Email: { type: String, unique: true },
});

const otp=mongoose.model(process.env.OTP_COLLECTION,OtpSchema)
module.exports=otp