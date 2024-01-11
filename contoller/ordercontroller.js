

const product = require("../model/product");
const user = require("../model/users");
const cart = require("../model/cart");
// const easyinvoice = require('easyinvoice')
const returns = require('../model/return')
const mongoosePaginate = require('mongoose-paginate-v2');
const wallet = require('../model/wallet')

const PDFDocument = require('pdfkit');
const exceljs = require('exceljs');
const pdfMake = require('pdfmake/build/pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');

const { ObjectId } = require('mongodb');


const puppeteer = require('puppeteer');

const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake.vfs;




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
            limit: 5,
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


        const htmlContent = invoiceData


        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = await browser.newPage();


        await page.setContent(htmlContent);


        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });


        await browser.close();


        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Invoice_${orderId}.pdf`);


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
        // const startDate = new Date(req.body.startDate);
        const format = req.body.downloadFormat;
        // const endDate = new Date(req.body.endDate);


        const startDate = new Date(req.body.startDate);
        startDate.setHours(0, 0, 0, 0); // Set the start time to midnight

        const endDate = new Date(req.body.endDate);
        endDate.setHours(23, 59, 59, 999); // Set the end time to 23:59:59:999
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
        const editedstartdate = startDate.toDateString()
        const editedenddate = endDate.toDateString()

        if (format.toLowerCase() === 'pdf') {
            try {



                // console.log(orders.Items[0].UserID,"consoleing the user id here")
                const content = [
                    { text: `Sales Report from ${editedstartdate} to ${editedenddate}`, style: 'header' },
                    { text: `Total Sales: ${totalSales.toFixed(2)}`, margin: [0, 10, 0, 0] },
                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            widths: [100, 100, 100, 100, 100],
                            body: [
                                ['Order Number', 'User Id', 'Date', 'Payment Method', 'Total Price'],
                                ...orders.map((order) => [
                                    order.orderNumber,
                                    order.UserID || '', 
                                    order.OrderDate ? order.OrderDate.toISOString().split('T')[0] : '',
                                    order.paymentMethod || '', 
                                    order.TotalPrice ? order.TotalPrice.toFixed(2) : '', 
                                ]),
                            ],

                        },
                    },
                ];
                console.log(content, "content of the sales report when option is pdf+++++++++++===============+++++++==========")

                const documentDefinition = {
                    content: content,
                    styles: {
                        header: {
                            fontSize: 18,
                            bold: true,
                            margin: [0, 0, 0, 10],
                        },
                        tableExample: {
                            margin: [0, 5, 0, 15],
                        },
                    },
                };

                const pdfDoc = pdfMake.createPdf(documentDefinition);

                pdfDoc.getBuffer((buffer) => {
                    res.setHeader('Content-Disposition', `attachment; filename="sales_report_${startDate}_${endDate}.pdf"`);
                    res.setHeader('Content-Type', 'application/pdf');
                    res.end(buffer);
                });
            } catch (error) {
                console.log(error, "error from sales report function - pdf")
            }

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