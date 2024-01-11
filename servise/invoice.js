// const product = require("../model/product");
// const user = require("../model/users");
// const order = require('../model/order');
// const puppeteer = require('puppeteer');

// async function generateInvoiceData(orderId) {
//     try {
//         const orders = await order.findOne({ _id: orderId });

//         const gstRate = 18;
//         if (!orders) {
//             throw new Error('Order not found');
//         }

//         // Function to generate items HTML
//         async function generateItemsHTML(items) {
//             const itemsHTMLPromises = items.map(async (item) => {
//                 const productDetails = await product.findOne({ _id: item.productId });

//                 return `
//                     <tr>
//                         <td>${productDetails.name}</td>
//                         <td>${item.quantity}</td>
//                         <td>${item.Price}</td>
//                         <td>${orders.TotalPrice}</td> <!-- Calculate total for each product -->
//                     </tr>
//                 `;
//             });

//             return Promise.all(itemsHTMLPromises);
//         }

//         const itemsHTML = (await generateItemsHTML(orders.Items)).join('');

//         // Function to calculate subtotal
//         function calculateSubtotal(items) {
//             return items.reduce((subtotal, item) => subtotal + item.Price * item.quantity, 0);
//         }

//         // Function to calculate GST amount
//         function calculateGST(items, gstRate) {
//             const subtotal = calculateSubtotal(items);
//             return (subtotal * gstRate) / 100;
//         }

//         // Function to calculate total amount
//         function calculateTotal(items, gstRate) {
//             const subtotal = calculateSubtotal(items);
//             const gstAmount = calculateGST(items, gstRate);
//             return subtotal + gstAmount;
//         }

//         const invoiceHTML = `
//            <!DOCTYPE html>
//             <html lang="en">
//             <head>
//              <link
//       rel="stylesheet"
//       href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css"
//       integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh"
//       crossorigin="anonymous"
//     />
//                 <meta charset="UTF-8">
//                 <meta http-equiv="X-UA-Compatible" content="IE=edge">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <style>
//                     body {
//                         font-family: 'Arial', sans-serif;
//                         margin: 0;
//                         padding: 0;
//                         background-color: #f5f5f5;
//                     }
//                     header {
//                         text-align: center;
//                         margin-bottom: 20px;
//                     }
//                     section {
//                         margin-bottom: 30px;
//                         padding: 20px;
//                         background-color: #fff;
//                         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
//                     }
//                     table {
//                         width: 100%;
//                         border-collapse: collapse;
//                         margin-top: 10px;
//                     }
//                     th, td {
//                         border: 1px solid #ddd;
//                         padding: 12px;
//                         text-align: left;
//                     }
//                     th {
//                         background-color: #f2f2f2;
//                     }
//                     .summary {
//                         text-align: right;
//                     }
//                     footer {
//                         margin-top: 20px;
//                         text-align: center;
//                     }
//                 </style>
//             </head>
//             <body>

//                     <h1 class="text-center mt-3 mb-3">INVOIVE</h1>

//                 <section>
//                  <div class="address-section">
//                 <div class="ml-3" >
//                     <p><strong >From:</strong> AROMA,Kozhikode, Kerala, India</p>
//                 </div>
//                 <div class="ml-3">
//                     <p><strong  >To:</strong> ,${orders.Address.Firstname}${orders.Address.Secondname}${orders.Address.Address}${orders.Address.City}, ${orders.Address.State},<p> ${orders.Address.Pincode}, ${orders.Address.Country},<p/> ${orders.Address.PhoneNumber}</p>
//                 </div>
//             </div>
//                     <h2>Order Details</h2>
//                     <table>
//                         <thead>
//                             <tr>
//                                 <th>Product Name</th>
//                                 <th>Quantity</th>
//                                 <th>Price</th>
//                                 <th>Total</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             ${itemsHTML}
//                         </tbody>
//                     </table>
//                 </section>
//                 <section class="summary">
//                     <h2>Invoice Summary</h2>
//                     <p><strong>Subtotal:</strong> ₹${calculateSubtotal(orders.Items)}</p>
//                     <p><strong>GST (${gstRate}%):</strong> ₹${calculateGST(orders.Items, gstRate)}</p>
//                     <p><strong>Discount:</strong>- ₹${orders.Discount}</p>

//                     <hr>
//                     <p><strong>Total: </strong> ₹${orders.TotalPrice}</p>
//                 </section>
//                 <footer>
//                     <p>Thank You For Your Purchase</p>
//                 </footer>
//             </body>
//             </html>
//             <script> <script
//       src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js"
//       integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo"
//       crossorigin="anonymous"
//     ></script>
//     <script
//       src="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/js/bootstrap.min.js"
//       integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6"
//       crossorigin="anonymous"
//     ></script></script>
//         `;

//         return invoiceHTML;
//     } catch (error) {
//         console.error('Error generating invoice data:', error);
//         throw error;
//     }
// }

// module.exports = { generateInvoiceData };
