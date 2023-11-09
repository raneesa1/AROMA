const express=require('express')
const router=express.Router()
const usercontroller=require('../contoller/usercontroller')


router.get('/', usercontroller.getlanding);
router.get('/login', usercontroller.login);
router.post('/login',usercontroller.loginpost);
router.get('/signup', usercontroller.signupget); 
router.post('/signup', usercontroller.signuppost);
router.get('/home',usercontroller.gethome)
router.get('/product', usercontroller.productget);
router.get('/cart', usercontroller.cartget);

module.exports=router