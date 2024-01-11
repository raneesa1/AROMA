const multer = require('multer');
const path = require('path');
const express = require('express')
const nodemailer = require('nodemailer')



const otpcontroller = require('../contoller/otpcontroller')
const router = express.Router()
const usercontroller = require('../contoller/usercontroller')
const cartcontroller = require('../contoller/cartcontroller')
const productcontroller = require('../contoller/productcontroller')
const addresscontroller = require('../contoller/addresscontroller')
const ordercontoller = require('../contoller/ordercontroller')
const couponcontroller = require('../contoller/couponcontroller')
const walletcontroller = require('../contoller/walletcontroller')
const wishlistcontroller = require('../contoller/wishlistcontroller')



const { userExist, verifyuser } = require('../middleware/userauth')
const { route } = require('./adminrouter');
const order = require('../model/order');




router.get('/', userExist, usercontroller.getlanding);
router.get('/login', userExist, usercontroller.login);
router.post('/login', userExist, usercontroller.loginpost);
router.get('/signup', userExist, usercontroller.signupget);
router.post('/signup', userExist, usercontroller.signuppost);
router.get('/home', verifyuser, usercontroller.gethome)




//products
router.get('/product', verifyuser, productcontroller.getproduct);
router.get('/productlist', verifyuser, usercontroller.getproductlist)




router.get('/logout', verifyuser, usercontroller.getlogout);



router.get('/checkout', verifyuser, usercontroller.getcheckout);






//OTP 

router.get('/otp', userExist, otpcontroller.sendOtp);
router.post('/send', otpcontroller.sendOtp);
router.post('/verify', otpcontroller.verifyOtp);
router.get('/resend', otpcontroller.sendOtp);

//password
router.post('verifyforgotpassword', otpcontroller.verifyOtp)
router.post('/forgotpassword', userExist, usercontroller.postforgotpassword)
router.get('/forgotresendpassword', userExist, usercontroller.postforgotpassword)
router.get('/forgotpassword', userExist, usercontroller.getforgotpassword);
router.get('/changepassword', usercontroller.getchangepassword);
router.post('/changepassword', usercontroller.postchangepassword);


//address
router.get('/address', verifyuser, addresscontroller.getaddress)
router.get('/editaddress/:id', verifyuser, addresscontroller.geteditaddress)
router.get('/addaddress', verifyuser, addresscontroller.getaddaddress)
router.post('/addaddress', verifyuser, addresscontroller.postaddaddress)
router.post('/updateaddress/:id', verifyuser, addresscontroller.postupdateaddress)
router.get('/deleteaddress/:id', verifyuser, addresscontroller.getdeleteaddress)



//resetpassword
router.get('/resetpassword', userExist, usercontroller.getresetpassword)
router.post('/resetpassword', userExist, usercontroller.postresetpassword)


const storage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, 'public/photos');
    },
    filename: function (req, file, cb) {
        // Define the filename for your uploaded files
        cb(null, Date.now() + '-' + file.originalname);
    },
})

const uploadprofile = multer({ storage: storage });


//userprofile
router.get('/profile', verifyuser, usercontroller.getprofile);
router.get('/editprofile', verifyuser, usercontroller.geteditprofile)
router.post('/editprofile', uploadprofile.single('editProfilePhoto'), verifyuser, usercontroller.posteditprofile)
router.get('/accountdetails', verifyuser, usercontroller.getaccountdetials)
router.get('/editdetails', usercontroller.geteditdetails)
router.get('/myorder', verifyuser, ordercontoller.getmyorder)



//cart,checkout
router.get('/cart', verifyuser, cartcontroller.getcart);
router.get('/add-to-cart', verifyuser, cartcontroller.addTocart)
router.post('/updatequantity', verifyuser, cartcontroller.updateQuantity)
router.post('/removeFromCart/:id', verifyuser, cartcontroller.removeCart)
router.get('/selectaddress', verifyuser, usercontroller.getselectaddress)
router.post('/topaymentpage', verifyuser, cartcontroller.placeOrder)
router.post('/addnewaddress', verifyuser, addresscontroller.postcheckoutaddaddress)


//razorpay
router.post('/generateRazorpayPayment', verifyuser, cartcontroller.generateRazorpay)
router.post("/verifyrazorpaypayment", verifyuser, cartcontroller.verifyRazorpayPayment)


//coupon
router.post('/apply-coupon', verifyuser, couponcontroller.useCoupon)
router.post('/cancel-coupon', verifyuser, couponcontroller.cancelcoupon)


//wallet
router.get('/wallet', verifyuser, walletcontroller.getwalletpage)
router.post('/razorpay/wallet', verifyuser, walletcontroller.wallet_razorpay)
router.post('/addMoneyToWallet', verifyuser, walletcontroller.addMoneyToWallet)


//invoice-------------------------------------------------------
router.post('/downloadinvoice', verifyuser, ordercontoller.postinvoice)


//wishlist
router.get('/wishlist', verifyuser, wishlistcontroller.getwishlist);
router.post('/addToWishlist', verifyuser, wishlistcontroller.addToWishlist)
router.delete('/remove-from-wishlist/:productId', verifyuser, wishlistcontroller.removeFromWishlist)

//filter sort search pagination
router.post('/api/updateProducts', verifyuser, productcontroller.updateProducts)






const returnstorage = multer.diskStorage({
    destination: function (req, file, cb) {

        cb(null, 'public/photos');
    },
    filename: function (req, file, cb) {
        // Define the filename for your uploaded files
        cb(null, Date.now() + '-' + file.originalname);
    },
})

const uploadreturn = multer({ storage: storage });



//order
router.get('/orderdetails/:id', verifyuser, ordercontoller.getorderdetials)
router.get('/ordermessage', verifyuser, cartcontroller.getordermessage)
router.post('/cancel-order/:orderId', verifyuser, ordercontoller.postcancelorder)
router.post('/return-order', uploadreturn.array('images', 3), verifyuser, ordercontoller.returnOrder)


router.get('/404',usercontroller.errorpage)





module.exports = router