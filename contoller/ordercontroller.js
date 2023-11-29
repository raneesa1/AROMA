

const product = require("../model/product"); // Import the product model
const user = require("../model/users");
const cart = require("../model/cart");

const order = require('../model/order')
const { json } = require("express");
const mongoose = require('mongoose');
const { productget } = require("./usercontroller");
const { ObjectId } = mongoose.Types;




const getmyorder = async (req, res) => {
    try {
        const userData = await user.findOne({ email: req.session.email });
        const userId = userData._id;

        const orderData = await order.find({ UserID: userId }).populate('Items.productId').sort({ OrderDate: -1 });



        res.render('user/myorder', { title: 'Orders', orderData, user: userData });
    } catch (error) {
        console.error(error);
    }
}




const getorderdetials = async (req, res) => {
    const userData = await user.findOne({ email: req.session.email });
    const orderid = req.params.id
    // console.log(orderid,"orderrereer000id))))))))))))))))))))))))))))))))))))))))))))))))")


    const orderData = await order.find({ _id: orderid }).populate('Items.productId');
    console.log(orderData, "orderdata))))000000000((((((((((((((((((")

    console.log(orderData.TotalPrice, "tototaaaallll238202408204202")
    res.render('user/orderdetials', {
        orderData
    })

    // console.log()

}




module.exports = { getmyorder, getorderdetials }