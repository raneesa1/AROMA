const category = require('../model/category');
const product = require('../model/product');
const { ObjectId } = require('mongodb')


const getproduct = async (req, res) => {
    // console.log("reached")
    const productId = req.query.id
    const products = await product.findOne({ _id: productId });
    const related = await product.find({ status: false }).sort({ date: -1 }).limit(4);
    const categorydata = await category.find()
    // console.log(products, 'produt')

    res.render('user/product1', { products, related, categorydata })
}



module.exports = { getproduct }