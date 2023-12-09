

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
    // console.log(orderData, "orderdata))))000000000((((((((((((((((((")

    // console.log(orderData.TotalPrice, "tototaaaallll238202408204202")
    res.render('user/orderdetials', {
        orderData
    })

    // console.log()

}



const postcancelorder = async (req, res) => {

    console.log('startedpost cancel order function')


    try {
        const orderId = req.body.orderId;
        const orderData = await order.findById(orderId);


        if (orderData.Status === 'Shipped') {
            return res.json({ success: false, message: 'Cannot cancel the order. It has already been shipped.' })
        }

        if (orderData.Status !== 'shipped') {
            orderData.Status = 'Cancelled';

            await orderData.save();
            return res.json({ success: true, message: 'Order has been canceled' });

        }



        // for (const item of orderData.Items) {
        //   if (item.productId) {
        //     const product = await product.findById(item.productId);

        //     if (product) {
        //       product.stock += item.quantity;
        //       await product.save();
        //     }
        //   }
        // }



    } catch (error) {
        console.error('Error canceling order:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while canceling the order' });
    }

}

module.exports = { postcancelorder, getmyorder, getorderdetials }