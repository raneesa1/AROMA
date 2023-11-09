const express = require('express');
const multer=require('multer')
const router = express.Router();
const admincontroller = require('../contoller/admincontroller');




router.get('/user', admincontroller.getusermanagement);
router.get('/category', admincontroller.getcategory);
router.get('/delete/:id',admincontroller.getdeleteuser)
router.get('/deleteproduct/:id',admincontroller.getdeleteproduct)
router.get('/block/:id', admincontroller.blockUser);
router.get('/unblock/:id', admincontroller.unblockUser);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
   
    cb(null, 'public/photos'); 
  },
  filename: function (req, file, cb) {
    // Define the filename for your uploaded files
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post('/addproduct',upload.array('images', 5),admincontroller.postaddproduct)
router.get('/addproduct',admincontroller.getaddproduct)
router.get('/product',admincontroller.getproductmanagement)


module.exports = router;