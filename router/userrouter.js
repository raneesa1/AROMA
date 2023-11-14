const express = require('express')
const nodemailer = require('nodemailer')
const otpcontroller = require('../contoller/otpcontroller')
const router = express.Router()
const usercontroller = require('../contoller/usercontroller')
const { userExist, verifyuser }= require('../middleware/userauth')


router.get('/',userExist, usercontroller.getlanding);
router.get('/login',userExist,usercontroller.login);
router.post('/login',userExist,usercontroller.loginpost);
router.get('/signup', userExist,usercontroller.signupget);
router.post('/signup', userExist,usercontroller.signuppost);
router.get('/home', verifyuser,usercontroller.gethome)
router.get('/product',verifyuser, usercontroller.productget);
router.get('/profile',verifyuser, usercontroller.getprofile);
router.get('/otp',userExist,otpcontroller.sendOtp);
router.get('/logout',verifyuser, usercontroller.getlogout);






// Handle OTP sending
router.post('/send', otpcontroller.sendOtp);

// Handle OTP verification
router.post('/verify', otpcontroller.verifyOtp);

// Handle OTP resend
router.get('/resend', otpcontroller.sendOtp);
// router.get('/resend', otpcontroller.sendOtp);


module.exports = router