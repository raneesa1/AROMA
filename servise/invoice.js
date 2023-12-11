const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');


module.exports = {
    generateInvoice: async (orderDetails) => {
        try {
            var data = {

                "customize": {

                },

                "images": {

                    // "logo": fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'logoPhonebazar.png'), 'base64'),


                },
                "sender": {
                    "company": "Gizmo",
                    "address": "Vellayil",
                    "zip": "673001",
                    "city": "Calicut",
                    "country": "Kerala"
                },
                "client": {
                    "company": orderDetails[0].Address.name,
                    "address": orderDetails[0].Address.addressLine,
                    "zip": orderDetails[0].Address.pincode,
                    "city": orderDetails[0].Address.city,
                    "state": orderDetails[0].Address.state,
                    // "Mob No":orderDetails[0].Address.mobileNumber,
                    // "state": orderDetails.Address.State,
                    // "Mob No": orderDetails.Address.Mobaile
                },
                "information": {
                    "Order ID": orderDetails[0]._id,
                    "date": orderDetails[0].OrderDate,
                    "invoice date": orderDetails[0].OrderDate,
                },
                "products": (orderDetails[0].Items && orderDetails[0].Items.length > 0) ? orderDetails[0].Items.map((product) => ({
                    "quantity": product.quantity,
                    "description": product.productId.ProductName,
                    "tax-rate": 18,
                    "price": product.productId.DiscountAmount
                })) : [],


                "bottom-notice": "Thank You For Your Purchase",
                "settings": {
                    "currency": "USD",
                    "tax-notation": "vat",
                    "currency": "INR",
                    "tax-notation": "GST",
                    "margin-top": 50,
                    "margin-right": 50,
                    "margin-left": 50,
                    "margin-bottom": 25
                },


            }
            const result = await easyinvoice.createInvoice(data);

            const filePath = path.join(__dirname, '..', 'pdf', `${orderDetails[0]._id}.pdf`);
            await fs.promises.writeFile(filePath, result.pdf, 'base64');

            return filePath;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
};