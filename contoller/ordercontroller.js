

const product = require("../model/product");
const user = require("../model/users");
const cart = require("../model/cart");
// const easyinvoice = require('easyinvoice')
const returns = require('../model/return')
const mongoosePaginate = require('mongoose-paginate-v2');
const wallet = require('../model/wallet')

const PDFDocument = require('pdfkit');
const exceljs = require('exceljs');
// const pdfMake = require('pdfmake/build/pdfmake');
// const vfsFonts = require('pdfmake/build/vfs_fonts');

const { ObjectId } = require('mongodb');


// const pdfFonts = require('pdfmake/build/vfs_fonts');
// pdfMake.vfs = pdfFonts.pdfMake.vfs;




const pdf = require('html-pdf');
const order = require('../model/order')
const { json } = require("express");
const mongoose = require('mongoose');
const { productget } = require("./usercontroller");


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



// const postinvoice = async (req, res) => {
//     try {
//         const { orderId } = req.body;
//         const invoiceData = await generateInvoiceData(orderId);


//         const htmlContent = invoiceData


//         const browser = await puppeteer.launch({
//             headless: true,
//             args: ['--no-sandbox', '--disable-setuid-sandbox'],
//         });
//         const page = await browser.newPage();


//         await page.setContent(htmlContent);


//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             printBackground: true,
//         });


//         await browser.close();


//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename=Invoice_${orderId}.pdf`);


//         res.send(pdfBuffer);
//     } catch (error) {
//         console.error('Error generating the invoice:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }



// const easyinvoice = require('easyinvoice');

// async function generateInvoiceData(orderId) {
//     try {
//         const orders = await order.findOne({ _id: orderId });

//         const gstRate = 18;
//         if (!orders) {
//             throw new Error('Order not found');
//         }

//         const items = orders.Items.map(async (item) => {
//             const productDetails = await product.findOne({ _id: item.productId });

//             return {
//                 quantity: item.quantity,
//                 description: productDetails.name,
//                 tax: {
//                     amount: ((item.Price * item.quantity) * gstRate) / 100,
//                     percentage: gstRate
//                 },
//                 price: item.Price
//             };
//         });

//         const invoiceData = {
//             documentTitle: 'INVOICE',
//             currency: 'INR',
//             taxNotation: 'GST',
//             marginTop: 25,
//             marginRight: 25,
//             marginLeft: 25,
//             marginBotom: 25,
//             sender: {
//                 company: 'AROMA',
//                 address: 'Kozhikode, Kerala, India',
//                 email: 'your-email@example.com',
//                 phone: '123-456-7890'
//             },
//             client: {
//                 company: `${orders.Address.Firstname} ${orders.Address.Secondname}`,
//                 address: `${orders.Address.Address}, ${orders.Address.City}, ${orders.Address.State}, ${orders.Address.Pincode}, ${orders.Address.Country}`,
//                 email: 'client-email@example.com',
//                 phone: orders.Address.PhoneNumber
//             },
//             invoiceNumber: `Invoice_${orderId}`,
//             products: await Promise.all(items),
//             bottomNotice: 'Thank You For Your Purchase'
//         };

//         return invoiceData;
//     } catch (error) {
//         console.error('Error generating invoice data:', error);
//         throw error;
//     }
// }

// const postinvoice = async (req, res) => {
//     try {
//         const { orderId } = req.body;
//         const invoiceData = await generateInvoiceData(orderId);

//         const pdfBuffer = await easyinvoice.createInvoice(invoiceData).catch((error) => {
//             console.error('Error generating invoice:', error);
//             throw error;
//         });


//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename=Invoice_${orderId}.pdf`);

//         console.log('pdfBuffer:', pdfBuffer);

//         res.send(pdfBuffer);
//     } catch (error) {
//         console.error('Error generating the invoice:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }




const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

pdfMake.vfs = pdfFonts.pdfMake.vfs;
function calculateSubtotal(items) {
    return items.reduce((subtotal, item) => subtotal + item.Price * item.quantity, 0);
}

function calculateGST(items, gstRate) {
    const subtotal = calculateSubtotal(items);
    return (subtotal * gstRate) / 100;
}

function calculateTotal(items, gstRate, discount) {
    const subtotal = calculateSubtotal(items);
    const gstAmount = calculateGST(items, gstRate);
    return subtotal + gstAmount - discount;
}

async function generateInvoiceData(orderId) {
    try {
        const orders = await order.findOne({ _id: orderId }).populate({
            path: 'Items.productId',
            model: 'product',
        });

        if (!orders) {
            throw new Error('Order not found');
        }

        const items = orders.Items.map((item) => {
            const productDetails = item.productId; // Access product details directly
            return [
                productDetails.name,
                item.quantity,
                item.Price,
                item.Price * item.quantity,
            ];
        });

        const total = calculateTotal(orders.Items, 18, orders.Discount);

        const invoiceData = {
            from: 'AROMA, Kozhikode, Kerala, India',
            to: `${orders.Address.Firstname} ${orders.Address.Secondname} ${orders.Address.Address} ${orders.Address.City}, ${orders.Address.State}, ${orders.Address.Pincode}, ${orders.Address.Country}, ${orders.Address.PhoneNumber}`,
            items: items,
            subtotal: calculateSubtotal(orders.Items),
            gst: calculateGST(orders.Items, 18),
            discount: orders.Discount,
            total: total,
        };

        return invoiceData;
    } catch (error) {
        console.error('Error generating invoice data:', error);
        throw error;
    }
}

const postinvoice = async (req, res) => {
    try {
        const { orderId } = req.body;
        const invoiceData = await generateInvoiceData(orderId);

        const docDefinition = {
            content: [
                { text: 'INVOICE', style: 'header' },
                { text: `From: ${invoiceData.from}`, margin: [0, 10] },
                { text: `To: ${invoiceData.to}`, margin: [0, 5] },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            ['Product Name', 'Quantity', 'Price', 'Total'],
                            ...invoiceData.items,
                        ],
                    },
                    margin: [0, 10],
                },
                { text: `Subtotal: ₹${invoiceData.subtotal}`, margin: [0, 10] },
                { text: `GST (18%): ₹${invoiceData.gst}`, margin: [0, 5] },
                { text: `Discount: - ₹${invoiceData.discount}`, margin: [0, 5] },
                { text: `Total: ₹${invoiceData.total}`, margin: [0, 10] },
                { text: 'Thank You For Your Purchase', style: 'footer', margin: [0, 20] },
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
                footer: { fontSize: 14, bold: true },
            },
        };

        const pdfBuffer = await new Promise((resolve, reject) => {
            const pdfDoc = pdfMake.createPdf(docDefinition);
            pdfDoc.getBuffer((buffer) => resolve(buffer), (error) => reject(error));
        });

        console.log('Generated PDF Buffer:', pdfBuffer.toString());

        if (pdfBuffer && pdfBuffer.length > 0) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Invoice_${orderId}.pdf`);
            res.setHeader('Content-Length', pdfBuffer.length);
            res.write(pdfBuffer, 'binary');
            res.end(null, 'binary');
        } else {
            console.error('Empty PDF Buffer');
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } catch (error) {
        console.error('Error generating the invoice:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
};





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

module.exports = { postinvoice, genereatesalesReport, returnOrder, postcancelorder, getmyorder, getorderdetials }