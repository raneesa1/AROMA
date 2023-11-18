const express = require('express')
const nodemailer = require('nodemailer')
const otpcontroller = require('../contoller/otpcontroller')
const router = express.Router()
const usercontroller = require('../contoller/usercontroller')
const { userExist, verifyuser } = require('../middleware/userauth')
const { route } = require('./adminrouter')


router.get('/', userExist, usercontroller.getlanding);
router.get('/login', userExist, usercontroller.login);
router.post('/login', userExist, usercontroller.loginpost);
router.get('/signup', userExist, usercontroller.signupget);
router.post('/signup', userExist, usercontroller.signuppost);
router.get('/home', verifyuser, usercontroller.gethome)
router.get('/product', verifyuser, usercontroller.productget);
router.get('/profile', verifyuser, usercontroller.getprofile);
router.get('/otp', userExist, otpcontroller.sendOtp);
router.get('/logout', verifyuser, usercontroller.getlogout);
router.get('/cart', verifyuser, usercontroller.getcart);
router.get('/wishlist', verifyuser, usercontroller.getwishlist);
router.get('/checkout', verifyuser, usercontroller.getcheckout);
router.get('/forgotpassword', userExist, usercontroller.getforgotpassword);
router.get('/changepassword', usercontroller.getchangepassword);
router.post('/changepassword', usercontroller.postchangepassword);






// Handle OTP sending
router.post('/send', otpcontroller.sendOtp);

// Handle OTP verification
router.post('/verify', otpcontroller.verifyOtp);

// Handle OTP resend
router.get('/resend', otpcontroller.sendOtp);
// router.get('/resend', otpcontroller.sendOtp);
router.post('verifyforgotpassword', otpcontroller.verifyOtp)

router.post('/forgotpassword', userExist, usercontroller.postforgotpassword)
router.get('/forgotresendpassword', userExist, usercontroller.postforgotpassword)



router.get('/accountdetails', verifyuser, usercontroller.getaccountdetials)


router.get('/editdetails', usercontroller.geteditdetails)
router.get('/myorder', verifyuser, usercontroller.getmyorder)
router.get('/address', verifyuser, usercontroller.getaddress)
router.get('/editaddress', verifyuser, usercontroller.geteditaddress)
router.get('/addaddress', verifyuser, usercontroller.getaddaddress)
router.get('/orderdetials', verifyuser, usercontroller.getorderdetials)
router.post('/resetpassword', userExist, usercontroller.postresetpassword)



router.get('/resetpassword', userExist, usercontroller.getresetpassword)

module.exports = router