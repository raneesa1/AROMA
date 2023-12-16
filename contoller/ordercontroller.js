

const product = require("../model/product");
const user = require("../model/users");
const cart = require("../model/cart");
const easyinvoice = require('easyinvoice')
const returns = require('../model/return')
const wallet = require('../model/wallet')

const { ObjectId } = require('mongodb');


const puppeteer = require('puppeteer');




const pdf = require('html-pdf');
const order = require('../model/order')
const { json } = require("express");
const mongoose = require('mongoose');
const { productget } = require("./usercontroller");

const { generateInvoiceData } = require('../servise/invoice');
const { log } = require("util");




const getmyorder = async (req, res) => {
    try {
        const userData = await user.findOne({ email: req.session.email });
        const userId = userData._id;

        console.log(userId,"user idd from")
        const orderData = await order.find({ UserID: userId }).populate('Items.productId').sort({ OrderDate: -1 });


        console.log(orderData, "order dataaaaaaaaaaaaaaaaaaaa")

        res.render('user/myorder', { title: 'Orders', orderData, user: userData });
    } catch (error) {
        console.error(error);
    }
}




const getorderdetials = async (req, res) => {
    try {
        const userData = await user.findOne({ email: req.session.email });
        const orderid = req.params.id
        console.log(orderid.split(" "),"orderrereer000id))))))))))))))))))))))))))))))))))))))))))))))))")


        const orderData = await order.find({ _id:orderid.trim()}).populate('Items.productId');
        // console.log(orderData, "orderdata))))000000000((((((((((((((((((")

        // console.log(orderData.TotalPrice, "tototaaaallll238202408204202")
        res.render('user/orderdetials', {
            orderData: orderData,
            orderId: orderid
        })
    } catch (err) {
        console.log(err, ' in order detail');
    }


    // console.log()

}



const postcancelorder = async (req, res) => {

    console.log('startedpost cancel order function')


    try {
        const orderId = req.body.orderId;
        const orderData = await order.findById(orderId)
        const refundedAmount = orderData.TotalPrice;


        if (orderData.Status === 'Shipped') {
            return res.json({ success: false, message: 'Cannot cancel the order. It has already been shipped.' })
        }





        console.log('outside the if case of order status')


        for (const item of orderData.Items) {
            if (item.productId) {
                console.log(item.productId, "data of item.productid ======================")
                const products = await product.findById(item.productId);
                console.log(products)

                if (products) {
                    console.log("inside the if case after finding the products")
                    products.stock += item.quantity;
                    console.log("stock increased")
                    await products.save();
                    console.log("product stock updated")
                }
            }
        }

        const userId = orderData.UserID;
        console.log(userId, "orderrrrriiiiffffff")



        if (orderData.paymentMethod !== "cod") {
            const userWallet = await wallet.findOne({ User_id: userId });

            if (userWallet) {

                userWallet.Account_balance += refundedAmount;

                // Add a transaction record to the wallet
                userWallet.Transactions.push({
                    Amount: refundedAmount,
                    Date: new Date(),
                    Description: `Refund for Order ${orderData.orderNumber}`,
                    Transaction_type: 'Refund',
                });

                await userWallet.save();
                console.log('Refund amount added to the useres wallet');
            }
        }

        if (orderData.Status !== 'shipped') {
            orderData.Status = 'Cancelled';

            await orderData.save();
            console.log('order status changed')
            return res.json({ success: true, message: 'Order has been canceled' });

        }



    } catch (error) {
        console.error('Error canceling order:______', error);
        return res.status(500).json({ success: false, message: 'An error occurred while canceling the order' });
    }

}



const postinvoice = async (req, res) => {
    try {
        const { orderId } = req.body;
        const invoiceData = await generateInvoiceData(orderId);

        // Create HTML content for the invoice
        const htmlContent = invoiceData

        // Launch a headless browser
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        // Set the content of the page with your HTML
        await page.setContent(htmlContent);

        // Generate PDF from the HTML content
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        // Close the browser
        await browser.close();

        // Set the response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${orderId}.pdf`);

        // Send the PDF buffer as the response
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating the invoice:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}







const returnOrder = async (req, res) => {
    try {
        const { orderId, itemId, returnReason, returnDescription } = req.body;


        console.log('orderId', orderId)
        console.log(itemId, "item idd")
        console.log(returnReason, "reason for return")
        const newitemId = itemId.trim()
        console.log(newitemId, "item id after trim")
        const orderData = await order.findById(orderId);


        if (!orderData) {
            return res.status(404).json({ message: 'Order not found' });
        }

        let itemReturn = null;
        let itemIndex = -1



        orderData.Items.forEach((item, index) => {
            const itemID = item._id.toString()
            if (itemID == newitemId) {
                itemReturn = item;
                itemIndex = index
            }
        });

        if (!itemReturn) {
            return res.status(404).json({ message: 'Item not found' });
        }
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const products = await product.findById(itemReturn.productId);
        if (!products) {
            return res.status(404).json({ message: 'Product not found' });
        }
        orderData.Items[itemIndex].status = 'return'
        const returnQuantity = itemReturn.quantity
        const price = products.DiscountAmount * returnQuantity;

        orderData.TotalPrice -= price
        await orderData.save();

        const users = await user.findOne({ email: req.session.email })
        const userId = users._id;
        const productId = products._id;

        const returnedDate = new Date();
        const orderDate = orderData.OrderDate;
        const returnData = new returns({
            userId,
            orderId,
            product: productId,
            reason: returnReason,
            quantity: returnQuantity,
            price,
            returnedDate,
            orderDate,
        });

        await returnData.save();

        return res.status(200).json({ success: true, message: 'Product returned successfully' });
    } catch (error) {
        console.error('Error returning the product:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};





module.exports = { returnOrder, postinvoice, postcancelorder, getmyorder, getorderdetials }