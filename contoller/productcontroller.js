const category = require('../model/category');
const product = require('../model/product');
const { ObjectId } = require('mongodb')

const mongoose = require('mongoose')

const getproduct = async (req, res) => {
    // console.log('this function is working for product one')  
    // console.log("reached")
    const productId = req.query.id
    const products = await product.findOne({ _id: productId });
    const related = await product.find({ status: false }).sort({ date: -1 }).limit(3);
    const categorydata = await category.find()

    // console.log(products, 'produt')

    res.render('user/product1', { products, related, categorydata })
}


const updateProducts = async (req, res) => {
    try {
        const { categories, search, sortOrder, page } = req.body;

        let filterQuery = {};

        if (categories && categories.length > 0) {
            const categoryDocs = await category.find({ name: { $in: categories } });
            const categoryIds = categoryDocs.map(category => category._id);
            filterQuery.category = { $in: categoryIds };
        }

        if (search) {
            filterQuery.name = { $regex: `^${search}`, $options: 'i' };
        }

        const sortOrderArray = Array.isArray(sortOrder) ? sortOrder : [sortOrder];
        const sortQuery = { price: sortOrderArray[0] === 'asc' ? 1 : -1 };

        const pageSize = 8; // Adjust this based on your desired page size
        const skip = (page - 1) * pageSize;

        const products = await product.find(filterQuery)
            .populate('category')
            .sort(sortQuery)
            .skip(skip)
            .limit(pageSize)
            .exec();

        const totalProducts = await product.countDocuments(filterQuery);

        const totalPages = Math.ceil(totalProducts / pageSize);

        res.json({
            products,
            totalPages,
        });
    } catch (error) {
        console.error('Error updating products:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



module.exports = { getproduct, updateProducts }