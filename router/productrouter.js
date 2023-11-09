const express = require('express');
const multer=require('multer')
const router = express.Router();
const productcontroller = require('../contoller/productcontroller');




router.get('/',productcontroller.getproduct)

module.exports=router