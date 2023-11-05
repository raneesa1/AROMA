const express=require('express')
const router=express.Router()
const usercontroller=require('../contoller/usercontroller')
const {body,validationresult}= require('express-validator')


router.get('/', usercontroller.home);
router.get('/login', usercontroller.login);
router.post('/login',usercontroller.postloginwithvalidation);
router.get('/signup', usercontroller.signupget); 
router.post('/signup', usercontroller.postsignupwithvalidation);
router.get('/home',usercontroller.gethome)
router.get('/product', usercontroller.productget);
router.get('/cart', usercontroller.cartget);

module.exports=router