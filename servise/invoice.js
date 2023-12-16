const product = require("../model/product");
const user = require("../model/users");
const order = require('../model/order');
const puppeteer = require('puppeteer');

async function generateInvoiceData(orderId) {
    try {
        const orders = await order.findOne({ _id: orderId });

        const gstRate = 18;
        if (!orders) {
            throw new Error('Order not found');
        }

        // Function to generate items HTML
        async function generateItemsHTML(items) {
            const itemsHTMLPromises = items.map(async (item) => {
                const productDetails = await product.findOne({ _id: item.productId });

                return `
                    <tr>
                        <td>${productDetails.name}</td>
                        <td>${item.quantity}</td>
                        <td>${item.Price}</td>
                        <td>${item.quantity * item.Price}</td> <!-- Calculate total for each product -->
                    </tr>
                `;
            });

            return Promise.all(itemsHTMLPromises);
        }

        const itemsHTML = (await generateItemsHTML(orders.Items)).join('');

        // Function to calculate subtotal
        function calculateSubtotal(items) {
            return items.reduce((subtotal, item) => subtotal + item.Price * item.quantity, 0);
        }

        // Function to calculate GST amount
        function calculateGST(items, gstRate) {
            const subtotal = calculateSubtotal(items);
            return (subtotal * gstRate) / 100;
        }

        // Function to calculate total amount
        function calculateTotal(items, gstRate) {
            const subtotal = calculateSubtotal(items);
            const gstAmount = calculateGST(items, gstRate);
            return subtotal + gstAmount;
        }

        const invoiceHTML = `
           <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f5f5f5;
                    }
                    header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    section {
                        margin-bottom: 30px;
                        padding: 20px;
                        background-color: #fff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    .summary {
                        text-align: right;
                    }
                    footer {
                        margin-top: 20px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <header>
                    <h1>Invoice</h1>
                </header>
                <section>
                 <div class="address-section">
                <div>
                    <p><strong>From:</strong> AROMA,<p> Kozhikode, Kerala, India</p></p>
                </div>
                <div>
                    <p><strong>To:</strong> ,${orders.Address.Firstname}${orders.Address.Secondname}<p>${orders.Address.Address},</p> ${orders.Address.City}, ${orders.Address.State},<p> ${orders.Address.Pincode}, ${orders.Address.Country},<p/> ${orders.Address.PhoneNumber}</p>
                </div>
            </div>
                    <h2>Order Details</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Product Name</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                    </table>
                </section>
                <section class="summary">
                    <h2>Invoice Summary</h2>
                    <p><strong>Subtotal:</strong> ${calculateSubtotal(orders.Items)}</p>
                    <p><strong>GST (${gstRate}%):</strong> ${calculateGST(orders.Items, gstRate)}</p>
                    <hr>
                    <p><strong>Total:</strong> ${calculateTotal(orders.Items, gstRate)}</p>
                </section>
                <footer>
                    <p>Thank You For Your Purchase</p>
                </footer>
            </body>
            </html>
        `;

        return invoiceHTML;
    } catch (error) {
        console.error('Error generating invoice data:', error);
        throw error;
    }
}

module.exports = { generateInvoiceData };
