const express = require('express');
const multer = require('multer')
const router = express.Router();
const admincontroller = require('../contoller/admincontroller');
const { adminExist, verifyadmin } = require('../middleware/adminauth')





router.get('/user', verifyadmin, admincontroller.getusermanagement);
router.get('/delete/:id', verifyadmin, admincontroller.getdeleteuser)
router.get('/deleteproduct/:id', verifyadmin, admincontroller.getdeleteproduct)
router.get('/block/:id', verifyadmin, admincontroller.blockUser);
router.get('/unblock/:id', verifyadmin, admincontroller.unblockUser);
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


router.post('/addproduct', upload.array('images', 5), admincontroller.postaddproduct)
router.get('/addproduct', verifyadmin, admincontroller.getaddproduct)
router.get('/addcategory', verifyadmin, admincontroller.getaddcategory)
router.get('/category', verifyadmin, admincontroller.getcategory);
router.post('/addcategory', admincontroller.postaddcategory)
router.get('/deletecategory/:id', verifyadmin, admincontroller.getdelecategory)


router.get('/product', verifyadmin, admincontroller.getproductmanagement)
router.get('/edit/:id', verifyadmin, admincontroller.geteditproduct)
router.get('/editcategory/:id', verifyadmin, admincontroller.geteditcategory)
router.post('/updatecategory/:id', admincontroller.postupdatecategory)
router.post('/update/:id', upload.array('images', 2), admincontroller.postupdateproduct)

router.get('/', verifyadmin, admincontroller.getdash)


router.get('/order', verifyadmin, admincontroller.getorder)

router.get('/logout', verifyadmin, admincontroller.getlogout);

module.exports = router;