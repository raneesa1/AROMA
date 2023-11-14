const mongoose=require('mongoose')
require('dotenv').config()

const OtpSchema = new mongoose.Schema({
  otp: { type: String},
  email: { type: String},
});

const otp = mongoose.model(process.env.OTP_COLLECTION,OtpSchema)
module.exports=otp