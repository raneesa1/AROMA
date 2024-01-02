

const product = require("../model/product");
const user = require("../model/users");
const cart = require("../model/cart");
const easyinvoice = require('easyinvoice')
const returns = require('../model/return')
const mongoosePaginate = require('mongoose-paginate-v2');
const wallet = require('../model/wallet')

const PDFDocument = require('pdfkit');
const exceljs = require('exceljs');

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

        console.log(userId, "user idd from")


        const options = {
            page: req.query.page || 1,
            limit: 2,
            sort: { OrderDate: -1 },
        };

        const orderData = await order
            .paginate({ UserID: userId }, options)
            .then(async (result) => {
                console.log(result);
                const populatedOrders = await order.populate(result.docs, { path: 'Items.productId' });
                result.docs = populatedOrders;
                return result;
            });

        console.log(orderData, "order dataaaaaaaaaaaaaaaaaaaa")

        res.render('user/myorder', {
            title: 'Orders', orderData: {
                docs: orderData.docs,
                totalPages: orderData.totalPages,
                page: orderData.page,
                hasPrevPage: orderData.hasPrevPage,
                hasNextPage: orderData.hasNextPage,
                prevPage: orderData.prevPage,
                nextPage: orderData.nextPage
            }, userData
        });
    } catch (error) {
        console.error(error);
    }
}





const getorderdetials = async (req, res) => {
    try {
        const userData = await user.findOne({ email: req.session.email });
        const orderid = req.params.id
        console.log(orderid.split(" "), "orderid")


        const orderData = await order.find({ _id: orderid.trim() }).populate('Items.productId');
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
            let userWallet = await wallet.findOne({ User_id: userId });

            if (!userWallet) {
                // If the user doesn't have a wallet, create one
                userWallet = new wallet({
                    User_id: userId,
                    Account_balance: 0,
                    Transactions: [],
                });
            }


            userWallet.Account_balance += refundedAmount;


            userWallet.Transactions.push({
                Amount: refundedAmount,
                Date: new Date(),
                Description: `Refund for Cancel Order ${orderData.orderNumber}`,
                Transaction_type: 'Refund',
            });

            await userWallet.save();
            console.log('Refund amount added to the useres wallet');

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

        const newitemId = itemId.trim()
        const orderData = await order.findById(orderId);
        const orderNumber = orderData.orderNumber



        console.log(req.body, "req.body of return order")

        console.log(newitemId, "consoling new item id")
        console.log(orderData, "consoling orderdata")

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
        orderData.Items[itemIndex].status = 'Requested'
        const returnQuantity = itemReturn.quantity

        const price = products.price * returnQuantity;
        console.log(products.price, "total price directly from the database")
        console.log(price, "defined price from te funciton")

        orderData.TotalPrice -= price

        await orderData.save();

        // const images = req.files.map(file => file.filename);

        const users = await user.findOne({ email: req.session.email })
        const userId = users._id;
        const productId = products._id;

        const productname = products.name


        console.log(productname, "name of the product which is returned")
        console.log(orderNumber, "order number of the returned product")


        const returnedDate = new Date();
        const orderDate = orderData.OrderDate;
        const returnData = new returns({
            userId,
            orderId,
            orderNumber,
            productname,
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

const genereatesalesReport = async (req, res) => {
    try {
        const startDate = new Date(req.body.startDate);
        const format = req.body.downloadFormat;
        const endDate = new Date(req.body.endDate);


        console.log(startDate, endDate, format, '==========')


        const orders = await order.find({
            Status: {
                $nin: ["returned", "Cancelled", "Rejected"]
            },
            OrderDate: {
                $gte: startDate,
                $lte: endDate,
            },
        }).populate("Items.productId");

        let totalSales = 0;

        orders.forEach((order) => {
            totalSales += order.TotalPrice || 0;
        });

        if (format.toLowerCase() === 'pdf') {
            const editedstartdate = startDate.toDateString()
            const editedenddate = endDate.toDateString()
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            // Your HTML template for the sales report
            const htmlContent = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
     
      <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css"
      integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
      crossorigin="anonymous"
    />
                    <title>Sales Report</title>
                </head>
                <body>
                <h1 class="text-center" style="margin-top:34px;">Sales Report </h1>
                    <h4 class="text-center">from ${editedstartdate} to ${editedenddate}</h4>
                    <p class="mt-5">Total Sales: ${totalSales.toFixed(2)}</p>

                    <table class="table-bordered align-content-center text-center p-3 ">
                        <thead >
                            <tr>
                                <th>Order Number</th>
                                <th>User Id</th>
                                <th>Date</th>
                                <th>Payment Method</th>
                                <th>Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.map(order => `
                                <tr>
                                    <td>${order.orderNumber}</td>
                                    <td>${order.UserID}</td>
                                    <td>${order.OrderDate ? order.OrderDate.toISOString().split('T')[0] : ''}</td>
                                    <td>${order.paymentMethod}</td>
                                    <td>${order.TotalPrice.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
                </html>
                 <script
      src="https://code.jquery.com/jquery-3.4.1.slim.min.js"
      integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n"
      crossorigin="anonymous"
    ></script>
    <script
      src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
      integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo"
      crossorigin="anonymous"
    ></script>
    <script
      src="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.min.js"
      integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6"
      crossorigin="anonymous"
    ></script>
            `;


            await page.setContent(htmlContent);

            // Generate PDF
            const pdfBuffer = await page.pdf();

            // Set response headers
            res.setHeader('Content-Disposition', `attachment; filename="sales_report_${startDate}_${endDate}.pdf"`);
            res.setHeader('Content-Type', 'application/pdf');

            // Send the PDF buffer as the response
            res.send(pdfBuffer);

            // Close the browser
            await browser.close();
        } else if (format.toLowerCase() === 'excel') {
            // Handle Excel logic using exceljs
            const workbook = new exceljs.Workbook();
            const worksheet = workbook.addWorksheet('Sales Report');

            // Add headers
            worksheet.addRow(['Order Number', 'User Id', 'Date', 'Payment Method', 'TotalPrice']);


            orders.forEach((order) => {
                worksheet.addRow([order.orderNumber, order.UserID, order.OrderDate, order.paymentMethod, order.TotalPrice]);
            });


            res.setHeader('Content-Disposition', `attachment; filename="sales_report_${startDate}_${endDate}.xlsx"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            await workbook.xlsx.write(res);
            res.end();
        } else {
            res.status(400).send('Unsupported format');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = { genereatesalesReport, returnOrder, postinvoice, postcancelorder, getmyorder, getorderdetials }