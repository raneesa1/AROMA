const express = require('express');
const multer = require('multer')
const router = express.Router();
const admincontroller = require('../contoller/admincontroller');
const { adminExist, verifyadmin } = require('../middleware/adminauth');
const couponcontroller = require('../contoller/couponcontroller');
const bannercontroller = require('../contoller/bannercontroller');






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







//category
router.get('/addcategory', verifyadmin, admincontroller.getaddcategory)
router.get('/category', verifyadmin, admincontroller.getcategory);
router.post('/addcategory', admincontroller.postaddcategory)
router.get('/deletecategory/:id', verifyadmin, admincontroller.getdelecategory)
router.get('/editcategory/:id', verifyadmin, admincontroller.geteditcategory)
router.post('/updatecategory/:id', verifyadmin, admincontroller.postupdatecategory)









router.get('/product', verifyadmin, admincontroller.getproductmanagement)
router.get('/edit/:id', verifyadmin, admincontroller.geteditproduct)

router.delete('/deleteimage/:productId/:index', verifyadmin, admincontroller.deleteImagess);




router.post('/update/:id', upload.array('images', 5), admincontroller.postupdateproduct)

router.get('/', verifyadmin, admincontroller.getdash)


router.get('/order', verifyadmin, admincontroller.getorder)

router.get('/logout', verifyadmin, admincontroller.getlogout);


router.get('/moredetials/:id', verifyadmin, admincontroller.getmoredetails)

router.post('/updateStatus/:orderId', verifyadmin, admincontroller.getorderStatus)


router.get('/coupon', verifyadmin, couponcontroller.getcoupon)
router.get('/addcoupon', verifyadmin, couponcontroller.addcoupon)
router.post('/addcoupon', verifyadmin, couponcontroller.postaddcoupon)
router.get('/editcoupon/:id', verifyadmin, couponcontroller.geteditcoupon)
router.post('/updatecoupon/:id', verifyadmin, couponcontroller.posteditcoupon)
router.get('/deletecoupon/:id', verifyadmin, couponcontroller.deletecoupon)



router.get('/returns', verifyadmin, admincontroller.getreturns)
router.post('/update-return-status/:returnId', admincontroller.postreturnstatus)




const bannerstorage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, 'public/photos');
  },
  filename: function (req, file, cb) {
    // Define the filename for your uploaded files
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const uploadbanner = multer({ storage: bannerstorage });

router.get('/banner', verifyadmin, bannercontroller.getbanner)
router.get('/addbanner',verifyadmin,bannercontroller.getaddbanner)
router.post('/addbanner', uploadbanner.single('image'), verifyadmin, bannercontroller.addbanner)
router.get('/editbanner/:id',verifyadmin,bannercontroller.editbanner)
router.post('/updatebanner/:id', uploadbanner.single('image'), verifyadmin,bannercontroller.updatebanner)
router.delete('/deleteimage/:id', bannercontroller.deleteBannerImage);
router.get('/deletebanner/:id',verifyadmin,bannercontroller.deletebanner)



module.exports = router;