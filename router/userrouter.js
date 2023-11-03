const express=require('express')
const router=express.Router()
const usercontroller=require('../contoller/usercontroller')

router.get('/',usercontroller.home)
router.get('/login',usercontroller.login)
router.post('/login',usercontroller.loginpost)
router.get('/home',usercontroller.signupget)
router.post('/signup',usercontroller.signuppost)


module.exports=router