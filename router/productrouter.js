const express = require('express');
const multer = require('multer')
const router = express.Router();
const productcontroller = require('../contoller/productcontroller');
const { userExist, verifyuser } = require('../middleware/userauth')




router.get('/', productcontroller.getproduct)



module.exports = router