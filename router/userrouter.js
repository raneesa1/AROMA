const multer = require('multer');
const path = require('path');




const express = require('express')
const nodemailer = require('nodemailer')
const otpcontroller = require('../contoller/otpcontroller')
const router = express.Router()
const usercontroller = require('../contoller/usercontroller')
const cartcontroller = require('../contoller/cartcontroller')
const { userExist, verifyuser } = require('../middleware/userauth')
const { route } = require('./adminrouter');


router.get('/', userExist, usercontroller.getlanding);
router.get('/login', userExist, usercontroller.login);
router.post('/login', userExist, usercontroller.loginpost);
router.get('/signup', userExist, usercontroller.signupget);
router.post('/signup', userExist, usercontroller.signuppost);
router.get('/home', verifyuser, usercontroller.gethome)
router.get('/product', verifyuser, usercontroller.productget);



router.get('/otp', userExist, otpcontroller.sendOtp);
router.get('/logout', verifyuser, usercontroller.getlogout);
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
router.get('/editaddress/:id', verifyuser, usercontroller.geteditaddress)
router.get('/addaddress', verifyuser, usercontroller.getaddaddress)
router.post('/addaddress', verifyuser, usercontroller.postaddaddress)



router.get('/orderdetials', verifyuser, usercontroller.getorderdetials)
router.post('/resetpassword', userExist, usercontroller.postresetpassword)

router.post('/updateaddress/:id', verifyuser, usercontroller.postupdateaddress)

router.get('/deleteaddress/:id', verifyuser, usercontroller.getdeleteaddress)

router.get('/resetpassword', userExist, usercontroller.getresetpassword)


const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, 'public/photos');
    },
    filename: function (req, file, cb) {
        // Define the filename for your uploaded files
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const uploadprofile = multer({ storage: storage });



router.get('/profile', verifyuser, usercontroller.getprofile);


router.get('/editprofile', verifyuser, usercontroller.geteditprofile)
router.post('/editprofile', uploadprofile.single('editProfilePhoto'), verifyuser, usercontroller.posteditprofile)



router.get('/cart', verifyuser, cartcontroller.getcart);
router.get('/add-to-cart', verifyuser, cartcontroller.addTocart)
module.exports = router