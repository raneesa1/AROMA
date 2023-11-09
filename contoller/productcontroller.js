const product = require('../model/product');
const {ObjectId}=require('mongodb')


const getproduct= async(req,res)=>{
    console.log("reached")
     const products = await product.find().limit(1);
     
     console.log(products,'produt  ')
    res.render('product1.ejs',{products})
}




module.exports={getproduct}